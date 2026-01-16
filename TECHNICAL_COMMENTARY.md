# TECHNICAL_COMMENTARY.md

## 1. Approach

### Overall approach

I approached this as a **product-focused, full-stack application**, prioritising correctness, usability, and security over visual polish or feature breadth. Since the backend was largely implemented, I focused on enforcing correct authorization boundaries and designing a frontend that enables users to complete core tasks quickly.

Throughout the exercise, I favoured **simple, explicit designs** over speculative abstractions, and made trade-offs appropriate for a time-boxed deliverable while clearly documenting how the system would evolve in production.

---

### Backend scope and admin authorization

My primary backend concern was **authorization correctness**, particularly around admin functionality.

I explicitly avoided any approach where admin status could be:
- Client-controlled
- Inferred from user input (e.g. email strings)
- Trusted based on frontend state

Instead, signup is hard-locked to standard users, and admin users are created via a controlled server-side process (seed script). This decision was driven by identifying a privilege-escalation risk in the original flow, where admin status could be inferred during signup. Hard-locking roles eliminated this entire class of vulnerability and mirrors how real systems bootstrap administrative access.

With more time, this could be extended to a super-admin–controlled promotion flow, keeping all authorization decisions centralized and auditable.

---

### Frontend architecture and user flow

The frontend is implemented as a **Next.js and React application** covering the full bookstore workflow: discovery, browsing, ordering, and administration.

#### Landing and authentication

Rather than routing users directly to authentication, I introduced a landing page that explains the product and encourages sign-in via a clear CTA. Login and signup are modelled as two states of a single page using a tab-based UI, reducing navigation friction.

UI components were chosen pragmatically:
- **Aceternity** for attention-grabbing landing sections
- **shadcn/ui** for forms and authentication, prioritising clarity and speed

---

### Book discovery and browsing

The main catalog prioritises **speed of interaction** over deep navigation. I used a **TanStack Table** to support:
- Keyword search (book title, author)
- Budget-based filtering via maximum price
- Immediate add-to-cart actions

Originally, users were required to navigate to a book details page before adding items to the cart. This introduced unnecessary friction and made the primary action unclear. I moved add-to-cart directly into the catalog view, reducing clicks and navigation while making the action explicit. This also better supports conversion-oriented flows and could be evaluated further via A/B testing in a real environment.

Book detail pages and author pages are implemented as secondary drill-down views. While backend metadata is currently limited, the structure allows future expansion without changing navigation patterns.

---

### Cart and checkout design

The shopping cart is implemented as a **persistent sidebar**, visible throughout browsing, rather than as a separate page. This reduces checkout friction by keeping selections visible and actionable at all times. Checkout is handled via a modal to keep users in context. Payment is simulated, but order records are created to reflect realistic backend behaviour.

---

### Admin functionality

Admin functionality is isolated from regular user flows. Admins access a dedicated area to:
- View, create, edit, and delete books
- Associate books with existing authors

During implementation, book creation initially required entering a raw `author_id`. While technically correct, this proved to be a poor admin experience. I replaced this with a selector populated from the backend, preserving data integrity while significantly improving usability.

All admin routes are protected server-side. Frontend role checks exist purely for UX and are never trusted for authorization.

---

### Key technical decisions and trade-offs

- **Client-side filtering & pagination** were chosen for MVP speed and UX iteration, with a clear path to move server-side at scale.
- **Short-lived access tokens and refresh tokens in HTTP-only cookies** reduce XSS risk.
- **Refresh token rotation with `jti`** enables single-session enforcement and clean logout at the cost of additional Redis complexity.
- **Seeded admin users** trade convenience for security and correctness.
- **Selective UI libraries** accelerated development without locking into heavy abstractions.

These decisions balanced development speed, outcome quality, maintainability, and production extensibility.

---

## 2. Implementation

### Development workflow and use of AI tools

I used a **hybrid workflow**, writing core logic myself while using AI tools as productivity aids for security reviews, performance analysis, debugging edge cases, and validating design decisions (e.g. authentication flows). All architectural decisions remained explicit and understood; AI tools accelerated iteration rather than replacing reasoning.

---

### Backend changes

I made targeted backend changes focused on correctness and security:

- Extended authentication with short-lived access tokens, refresh cookies, rotation via `jti`, and explicit logout invalidation
- Removed client-controlled role assignment and hard-locked signup roles
- Added SQL joins to return books with author metadata in a single response, rather than fetching books and authors separately on the frontend
- Added backend tests covering refresh rotation and logout semantics
- Introduced seed scripts and developer tooling for repeatable setup

One notable issue discovered during review was that refresh tokens were rotated in Redis but the refresh cookie was not updated. This caused the second refresh attempt to fail with a 401. Updating the refresh endpoint to reset the cookie resolved the issue and aligned refresh behaviour with login.

Secrets are configured for local development; production would inject them via a secret manager.

---

### Frontend implementation

The frontend cleanly separates public and protected routes, using layout-level enforcement for authentication and shared UI (cart sidebar, breadcrumbs).

I implemented:
- Centralised auth handling (login, refresh, logout)
- Cart and breadcrumb context
- Schema validation with Zod
- Centralised API utilities to keep side effects predictable

UI work focused on task completion rather than styling:
- Informative landing page with microcopy and featured authors
- Tab-based auth flow
- Searchable catalog with direct add-to-cart
- Modal checkout
- Layout guards and skeletons to prevent visual shift

---

### Iterative refinements

I intentionally developed in phases:
1. Functional correctness  
2. UX improvements  
3. Security and performance hardening  

Several refinements were driven by issues uncovered during review. For example, logout initially invalidated access tokens but left refresh sessions active, allowing new access tokens to be minted post-logout. This was fixed by explicitly deleting refresh state in Redis. I also added targeted tests around refresh rotation after fixing this behaviour.

These changes prioritised reducing friction and eliminating correctness issues over adding new features.

---

## 3. Discussion

### Reflection on the implementation

The implementation successfully delivers all required user flows without unnecessary complexity. The decision to prioritise correctness first, followed by UX and security refinement, proved effective and kept the project focused.

I’m particularly satisfied with moving data joins server-side to simplify frontend logic and with restructuring user flows (e.g. add-to-cart placement) to better match real user behaviour.

---

### Challenges encountered

The most challenging aspect was **authentication and security**. Integrating refresh semantics, logout invalidation, and frontend rehydration surfaced subtle edge cases that required careful reasoning about trust boundaries and session state.

Preventing admin privilege escalation also required revisiting initial assumptions and hardening the trust model.

UX decisions—such as cart placement and navigation depth—were another recurring challenge, requiring iteration to balance usability with scope.

---

### What I would do differently

With hindsight, I would simplify earlier—particularly around authentication—by locking down a minimal role model first and layering complexity more gradually. While the deeper security work was valuable, it added complexity earlier than strictly necessary.

---

### How I would extend the application

Given more time, I would focus on:
1. **Payment processing** with a real provider and order lifecycle handling  
2. **Richer book and author pages** (images, expanded metadata)  
3. **Server-side search and pagination** for scalability  
4. **Admin auditability**, including role hierarchies and change logs  
5. **Expanded testing and instrumentation**

---

### Non-functional considerations

Accessibility was partially addressed through semantic HTML, form labels, validation errors, and focusable UI components provided by shadcn/ui. With more time, I would conduct a WCAG-focused audit covering keyboard navigation, focus order, ARIA roles, and color contrast, and add automated accessibility testing (e.g. axe-core).

I would also add global error boundaries, consistent loading and empty states, and clearer user-facing failure messaging. Production hardening would include structured logging, basic observability, and standard security headers (CSP, HSTS, X-Frame-Options).

---

### Final reflection

The most valuable outcome of this exercise was working through **real trade-offs under constraints**. I deliberately favoured clarity, explicit security boundaries, and iterative UX improvements grounded in real user behaviour.

If continued, I would keep the same philosophy: start simple, validate early, and evolve deliberately rather than optimising prematurely.
