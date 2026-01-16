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

Instead, signup is hard-locked to standard users, and admin users are created via a controlled server-side process (seed script). This completely removes privilege-escalation risk during signup and mirrors how real systems bootstrap administrative access.

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

Book detail pages and author pages are implemented as secondary drill-down views. While backend metadata is currently limited, the structure allows future expansion without changing navigation patterns.

---

### Cart and checkout design

The shopping cart is implemented as a **persistent sidebar**, visible throughout browsing, to reduce friction between discovery and checkout. Checkout is handled via a modal to keep users in context. Payment is simulated, but order records are created to reflect realistic backend behaviour.

---

### Admin functionality

Admin functionality is isolated from regular user flows. Admins access a dedicated area to:
- View, create, edit, and delete books
- Associate books with existing authors via a selector (rather than raw IDs)

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

I used a **hybrid workflow**, writing core logic myself while using AI tools as productivity aids for:
- Security, performance, and code reviews
- Debugging edge cases
- Validating design decisions (e.g. auth flows)

All architectural decisions remained explicit and understood; AI tools accelerated iteration rather than replacing reasoning.

---

### Backend changes

I made targeted backend changes focused on correctness and security:

- Extended authentication with short-lived access tokens, refresh cookies, rotation via `jti`, and explicit logout invalidation
- Removed client-controlled role assignment and hard-locked signup roles
- Added SQL joins to fetch books together with their authors, simplifying frontend data access
- Added backend tests covering refresh rotation and logout semantics
- Introduced seed scripts and developer tooling for repeatable setup

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

Notable refinements included:
- Moving add-to-cart directly into the catalog view
- Making the cart persistent rather than a separate page
- Replacing raw `author_id` inputs with author selectors in admin flows
- Fixing stale auth state and logout semantics discovered during review

These changes prioritised reducing friction in critical user paths over adding new features.

---

## 3. Discussion

### Reflection on the implementation

The implementation successfully delivers all required user flows without unnecessary complexity. The decision to prioritise correctness first, followed by UX and security refinement, proved effective and kept the project focused.

I’m particularly satisfied with the clear separation of frontend and backend responsibilities and with moving data joins server-side to simplify the UI.

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

### Final reflection

The most valuable outcome of this exercise was working through **real trade-offs under constraints**. I deliberately favoured clarity, explicit security boundaries, and iterative UX improvements grounded in real user behaviour.

If continued, I would keep the same philosophy: start simple, validate early, and evolve deliberately rather than optimising prematurely.
