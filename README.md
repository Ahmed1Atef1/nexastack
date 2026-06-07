# NexaStack: Full-Stack Enterprise Software Agency

NexaStack is a production-grade, full-stack Single Page Application (SPA) designed as the landing page and administrative dashboard for a premium software development agency. 

It features a responsive, dark-mode native interface, a secure backend with rate limiting and input sanitization, and a modern component architecture.

---

## 🚀 Tech Stack

### Frontend (Client)
* **Angular 21** (Standalone Components, strictly typed)
* **Reactive Forms** (Synchronous, component-driven validation)
* **ChangeDetectionStrategy.OnPush** (High-performance rendering)
* **SCSS** (Custom responsive design system, zero external UI libraries)

### Backend (API)
* **ASP.NET Core 8 Web API** (RESTful architecture)
* **Entity Framework (EF) Core** (Code-first ORM)
* **SQL Server** (Relational database)
* **Native Rate Limiting** (Fixed-window algorithm to prevent spam)

---

## 🔒 Security & Performance Features
1. **Global Exception Handling:** Custom ASP.NET middleware intercepts unhandled exceptions and standardizes them into `ProblemDetails` JSON objects, preventing stack trace leaks.
2. **Anti-Spam Rate Limiting:** Built-in .NET 8 middleware restricts API calls to `4 requests / 2 minutes` per IP address, backed by real-time UI countdowns.
3. **Input Sanitization:** Regex-based sanitizers actively strip malicious HTML tags from server-side DTOs to prevent XSS attacks.
4. **Optimized Change Detection:** Advanced Angular techniques (`OnPush`, explicit `detectChanges()`) and native Intersection Observers ensure a butter-smooth 60fps experience without excessive DOM repaints.

---

## 🛠️ How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [.NET 8 SDK](https://dotnet.microsoft.com/download)
* [SQL Server Express / LocalDB](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### 1. Start the Backend API
1. Navigate to the API directory:
   ```bash
   cd NexaStack.API
   ```
2. Apply database migrations (EF Core will automatically create the `NexaStackDb` database):
   ```bash
   dotnet ef database update
   ```
3. Run the API:
   ```bash
   dotnet run
   ```
   *The API will start on `http://localhost:5016` (or similar).*

### 2. Start the Frontend Client
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd nexastack-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   *The application will launch at `http://localhost:4200`.*

---

## 📂 Project Structure
* `/NexaStack.API` - The ASP.NET Core 8 backend.
* `/nexastack-client` - The Angular 21 frontend.
