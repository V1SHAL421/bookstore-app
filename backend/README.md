# Full-Stack Technical Test

Welcome! This is a **full-stack, frontend-leaning technical test** designed to assess your ability to:

1. **Produce production-ready code** - Write clean, maintainable, well-tested code that follows best practices
2. **Clearly articulate your work** - Document your decisions, approach, and implementation details
3. **Make sound, product-focused, engineering decisions** - Choose appropriate solutions and justify your technical choices

You'll be working with a pre-built FastAPI backend that powers a bookstore application. Your task will be to build a frontend that consumes this API while partially extending the backend with new features.

## Before You Begin

**📖 Read the [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) first!**

This document contains everything you need to know about the existing system.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- [Just](https://github.com/casey/just) command runner (optional but recommended)

### Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start the application:**
   ```bash
   just start
   ```

3. **Verify setup:**
   ```bash
   just test
   ```

   You should see all 60 tests passing.

### Development Commands

```bash
just build          # Build Docker images
just start          # Start all services and tail logs
just stop           # Stop all services
just shell          # Open bash shell in API container
just test           # Run tests inside container
just db-reset       # Reset database (drops all data)
```

## Test Deliverables

You'll create a production-ready bookstore application with both backend security enhancements and a complete frontend experience. This involves implementing role-based access control for content management and building a customer-facing web application that allows users to discover and purchase books.

### Backend: Admin Access Control

Currently, anyone can create, update, or delete books and authors. We need to restrict these operations to admin users only. Regular customers should still be able to browse books and authors, but only administrators should have permission to manage the catalog via the API.

**Note:** You only need to implement this in the backend. Admins should be able to manage books and authors through API endpoints, but you don't need to build a frontend interface for these admin operations.

### Frontend: Bookstore Application

Build a Next.js + React application that provides a complete bookstore experience:

**User Authentication**
- Login page for existing users
- Sign up page for new customers

**Book Browsing**
- Homepage displaying all available books
- Author pages showing all books by a specific author
- Book detail pages with author information and pricing

**Shopping Experience**
- Shopping cart functionality (managed in the frontend as session state)
- Add books to cart and update quantities
- Checkout process that creates order records in the database
- View order history

**Note:** You don't need to implement payment processing. The checkout process should simply create order records in the database with the cart contents.

### Bonus: Admin Book Management UI (Optional)

If you have time and want to go further, build admin book management capabilities into your frontend application:
- View, create, edit, and delete books
- View, create, edit, and delete authors
- Only accessible to users with admin privileges

### Technical Commentary Document

As you work through the test, create a `TECHNICAL_COMMENTARY.md` file with three sections:

**1. Approach**
- How you plan to tackle each deliverable
- Key technical decisions and trade-offs you're considering
- Example: Should a particular piece of functionality live in the frontend or backend? Why?
- Reasoning behind your decisions considering: development pace, outcome quality, ease of implementation, scalability, maintainability

**2. Implementation**
- What you actually built and how
- Any deviations from your original approach and why
- Challenges encountered and how you solved them

**3. Discussion**
- Reflection on how the implementation went
- What was particularly challenging or time-consuming
- What you would do differently in the future
- How you would extend or improve the application given more time

**Tip:** Consider using AI note-taking tools or voice dictation software to capture your thoughts more quickly as you work. Speaking through your reasoning can often be faster and more natural than typing everything out.

### Use of AI Tools

We encourage you to use AI tools (like ChatGPT, Claude, Copilot, etc.) as productivity aids throughout this test. Modern software development involves leveraging these tools effectively, and we want to see how you use them. What matters is your ability to make sound technical decisions, understand the code you're writing, and articulate your reasoning - whether you wrote every character yourself or collaborated with AI to get there faster.

## Evaluation

We'll be assessing your submission holistically, looking at how well you've solved the problem and how clearly you've communicated your thinking.

**What we care most about:** Does the application work? Can users actually accomplish the tasks they need to - browsing books, viewing authors, placing orders, and (for admins) managing the catalog? The user interface should be functional and intuitive. We're not evaluating visual design or aesthetics; a clean, unstyled interface that works well is perfectly fine. What matters is that users can navigate the application and complete their tasks effectively.

**Your technical commentary is crucial.** We want to understand how you approached the problem, what trade-offs you considered, and why you made particular decisions. For example, where did you choose to implement certain logic - frontend or backend? Why? How did you balance speed of implementation with code quality? What would you do differently with more time? Your ability to articulate these decisions and reflect honestly on the work is just as important as the code itself.

**Code quality and testing matter**, but in service of building something that works. We expect clean, maintainable code that follows best practices, and ideally, we'd like to see tests for the backend changes you make. Overall, we're most interested in seeing a working application with thoughtful decisions than perfect code that doesn't quite deliver on the requirements.

Finally, we're evaluating your product thinking. Did you make pragmatic choices? Can you explain the trade-offs between different approaches? Do you understand the implications of your decisions on maintainability and scalability? The best submissions demonstrate not just technical skill, but an understanding of how to build software that solves real problems effectively.

## Questions?

Review the [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) for detailed technical documentation about the existing system.

If you have any questions about the test, please email ryan@meetdex.ai

---

**A note on scope:** We recognize this is a substantial technical test. We suggest spending up to 4 hours on it, though you're welcome to spend more or less depending on your pace and approach. If you're concerned about the time commitment, please reach out to discuss - we'd rather have a conversation about adjusting the scope than have you feel overwhelmed by the task.

Good luck! 🚀
