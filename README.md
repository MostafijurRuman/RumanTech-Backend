<div align="center">
  <h1>🚀 RumanTech Backend API</h1>
  <p><strong>A Modern, Robust, and Scalable headless eCommerce REST API</strong></p>

  <p>
    <a href="https://rumantech-backend.onrender.com/api/v1">Live API URL</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

<br />

## 🌟 Overview

RumanTech API serves as the core powerhouse for the RumanTech eCommerce platform. Built with **Node.js, Express, TypeScript, and Prisma**, it delivers high-performance operations, robust security, and seamless database interactions powered by **PostgreSQL**.

### 🔗 Live API Base Endpoint
👉 **[https://rumantech-backend.onrender.com/api/v1](https://rumantech-backend.onrender.com/api/v1)**

---

## ✨ Features

- **🔐 Advanced Authentication:** JWT-based flow with robust password hashing and reset capabilities.
- **🛒 eCommerce Core:** Complete lifecycle for Products, Categories, Brands, Cart, and Orders.
- **🛡️ Role-Based Access Control (RBAC):** Distinct privileges for Admins vs standard Users.
- **🖼️ Media Management:** Seamless image uploading via Cloudinary integration.
- **🚀 Database Excellence:** Typesafe database queries with Prisma ORM and PostgreSQL.
- **⚡ Error Handling:** Global centralized error interception and formatted API responses.

---

## 🛠 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Storage:** [Cloudinary](https://cloudinary.com/)
- **Linting & Formatting:** ESLint + Prettier

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Docker for local DB)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MostafijurRuman/RumanTech-Backend.git
   cd RumanTech-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```

4. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```
   *(Optional) Seed the database:*
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000/api/v1`

---

## 👨‍💻 Developer Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode |
| `npm run build` | Compiles TypeScript into JavaScript |
| `npm start` | Runs the compiled production code |
| `npm run lint` | Lints the codebase |
| `npm run seed` | Injects mock data into the database |

---

<div align="center">
  <i>Built with ❤️ for RumanTech Platform.</i>
</div>
