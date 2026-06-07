# NexaStack: System Architecture & Interview Preparation Guide

This document serves as a comprehensive breakdown of the NexaStack architecture. Use this to prepare for your internship assessment interview. It explains what tools were used, why they were chosen, how they interact, and provides "Pro Hints" for answering technical questions.

---

## 1. High-Level Architecture Overview
NexaStack is a modern **N-Tier Single Page Application (SPA)**.
* **Frontend:** Angular 21 (Standalone Components)
* **Backend:** ASP.NET Core 8 Web API
* **Database:** SQL Server (accessed via Entity Framework Core)
* **Design:** Custom SCSS with a responsive, dark-mode native design system.

---

## 2. Frontend: Angular
### What we used & Why:
* **Standalone Components:** We avoided `NgModules` entirely. *Why?* It's the modern Angular standard (v15+), reducing boilerplate and making components highly modular, easier to lazy-load, and easier to test.
* **Reactive Forms:** Used for the Contact Form. *Why?* Unlike Template-Driven forms, Reactive Forms keep the logic in the TypeScript class. This makes complex validation (like email patterns and min-lengths) strictly typed and synchronous.
* **ChangeDetectionStrategy.OnPush:** Applied globally to components. *Why?* By default, Angular checks every component on the page whenever any event happens anywhere. `OnPush` tells Angular to only re-render a component if its input properties change or an event fires *inside* it. This drastically improves performance.
* **Global HTTP Interceptor:** Catches all API errors in one place. *Why?* Instead of writing `error: (err) => showToast(err)` inside every single component, the interceptor catches it globally and shows a Toast. This keeps components strictly focused on business logic.

**💡 Pro Hint (Change Detection):** If they ask about challenges, mention the "OnPush async bug." Explain how you learned that when using `OnPush`, asynchronous operations (like `setInterval` or HTTP responses) sometimes require explicit `this.cdr.detectChanges()` to force a UI repaint, because they can occasionally drop out of the standard Angular tick cycle.

---

## 3. Backend: ASP.NET Core 8 Web API
### What we used & Why:
* **Entity Framework (EF) Core:** Used as our Object-Relational Mapper (ORM). *Why?* It eliminates writing raw SQL queries, which inherently protects the application from SQL Injection attacks. It also allows us to write database queries using strictly-typed C# LINQ.
* **Global Exception Middleware:** A custom pipeline interceptor. *Why?* If the code crashes (e.g., a Null Reference), the standard behavior is to return a 500 status code with a stack trace. This is a massive security risk. Our middleware catches all unhandled exceptions globally and converts them into standardized, safe JSON (`ProblemDetails`) without leaking internal server details.
* **Fixed-Window Rate Limiting:** Implemented natively in .NET 8. *Why?* To prevent spam bots from flooding the database via the contact form. We configured it to 4 requests per 2 minutes per IP.
* **Regex Input Sanitization:** Used on the backend models. *Why?* Even if the Angular frontend is secure, a malicious user can bypass the frontend and send POST requests directly via Postman. Our backend actively strips HTML tags (`<script>`) from the `ContactInquiry` strings to prevent Cross-Site Scripting (XSS).

**💡 Pro Hint (Rate Limiting):** Point out that instead of just throwing a generic "429 Too Many Requests" error, you explicitly extracted the `Retry-After` metadata from the ASP.NET pipeline and passed it to the frontend. This allowed you to build a highly professional, real-time countdown timer in the Angular UI.

---

## 4. Specific Technical Deep-Dives to Mention

### The Timezone & UTC Strategy
* **How it works:** All dates are saved into SQL Server as raw UTC time. 
* **Why:** If you save local time, the database becomes a mess when accessed across different time zones.
* **The Trick:** The API sends the date as an ISO string. In the Angular `InquiryList` component, we specifically appended a `"Z"` to the end of the string (e.g., `2026-06-06T04:57:00Z`). This `"Z"` signals to the browser's JavaScript engine that the time is strictly UTC, prompting the browser to automatically convert it to the viewer's local timezone (e.g., showing 7:57 AM in Egypt).

### The Scroll Spy (Navigation Highlighting)
* **How it works:** As the user scrolls, the active navbar link changes.
* **The Trick:** Instead of using the legacy `element.offsetTop` (which is vulnerable to CSS relative positioning bugs), we used `element.getBoundingClientRect().top`. This perfectly calculates the distance from the top of the user's viewport, guaranteeing mathematical precision.

---

## 5. How to Improve the System in the Future (Bonus Points)
If they ask, *"What would you add if you had more time?"*, use these answers:

1. **Authentication & JWT:** The Admin Dashboard currently has no login screen. I would implement ASP.NET Core Identity to issue JSON Web Tokens (JWT), and use an Angular Auth Guard to protect the `/admin` route.
2. **Pagination:** The `InquiryList` currently loads all records at once. If the business scales to 50,000 inquiries, this will cause memory issues. I would implement server-side pagination (skip/take) using EF Core.
3. **SignalR (WebSockets):** Instead of manually refreshing the dashboard to see new inquiries, I would add SignalR to push real-time notifications to the admin dashboard the moment a user submits the contact form.
4. **Caching:** Implement `IMemoryCache` or Redis on the backend to cache the statistical counts (Total, Read, Unread) to reduce database load on the dashboard load.
