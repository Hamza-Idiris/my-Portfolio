# 🌟 Hamza Idiris — Full-Stack Developer & Software Engineer Portfolio

<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,20,50,100&height=220&section=header&text=Hamza%20Idiris&fontSize=64&fontAlignY=38&desc=Full-Stack%20MERN%20Architect%20%7C%20Creative%20UI%2FUX%20Engineer&descFontSize=20&descAlignY=62&fontColor=ffffff" width="100%" />

  <br/>

  [![GitHub Stars](https://img.shields.io/github/stars/Hamza-Idiris/my-Portfolio?style=for-the-badge&logo=starship&color=4F46E5&logoColor=white)](https://github.com/Hamza-Idiris/my-Portfolio/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/Hamza-Idiris/my-Portfolio?style=for-the-badge&logo=git&color=06B6D4&logoColor=white)](https://github.com/Hamza-Idiris/my-Portfolio/network/members)
  [![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)
  [![Live Demo](https://img.shields.io/badge/Live-Demo-F59E0B?style=for-the-badge&logo=google-chrome&logoColor=white)](https://hamzaidiris.dev)

  <br/>

  <h3>⚡ High-Performance, Interactive, Enterprise-Grade Full-Stack Portfolio ⚡</h3>

  <p align="center">
    <b>A modern showcase built with React 18, Vite, Express, MongoDB, Tailwind CSS, TanStack Query, Framer Motion, and Cloudinary.</b>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-contact--socials">Contact</a>
  </p>

</div>

---

## 🚀 Highlights & Key Features

<table>
  <tr>
    <td width="50%">
      <h3>💎 Dynamic Client Architecture</h3>
      <ul>
        <li><b>React 18 & Vite:</b> Blazing fast HMR and optimized bundle splitting.</li>
        <li><b>Framer Motion:</b> Smooth micro-interactions, spring physics, and scroll reveals.</li>
        <li><b>Certifications Gallery:</b> Modal view, zoom preview, and credential verification.</li>
        <li><b>Responsive Dark/Light UI:</b> Modern glassmorphism design system.</li>
        <li><b>SEO Optimized:</b> Dynamic OpenGraph tags, semantic JSON-LD metadata.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🛡️ Robust Express & Mongo Backend</h3>
      <ul>
        <li><b>RESTful API:</b> Scalable architecture with layered controllers and services.</li>
        <li><b>JWT & Cookie Auth:</b> Secure session management with role-based access (RBAC).</li>
        <li><b>Admin CMS Panel:</b> Full CRUD for Projects, Certifications, Skills, and Inquiries.</li>
        <li><b>Cloudinary Storage:</b> Automated asset optimization and cloud CDN uploads.</li>
        <li><b>Rate Limiting & Helmet:</b> Comprehensive API security defenses.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack & Tooling

<div align="center">

### Frontend Ecosystem
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F05032?style=for-the-badge&logo=lucide&logoColor=white)

### Backend Ecosystem
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

</div>

---

## 📁 Repository Structure

```tree
my-Portfolio/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets, favicon, manifests
│   ├── src/
│   │   ├── app/                # App router, global providers, layouts
│   │   ├── components/         # Reusable UI, public & admin components
│   │   │   ├── admin/          # Admin CRUD dashboards & data tables
│   │   │   ├── public/         # Hero, Projects, Certifications, Timeline
│   │   │   └── ui/             # Glassmorphism cards, buttons, badges, modals
│   │   ├── hooks/              # Custom React hooks (theme, auth, animations)
│   │   ├── lib/                # Axios instance, SEO utilities, helper functions
│   │   ├── pages/              # Public & Protected Admin Route Pages
│   │   └── styles/             # Global styles and Tailwind configurations
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # DB connection, Cloudinary, Env configurations
│   │   ├── controllers/        # Request handlers (Certifications, Projects, etc.)
│   │   ├── middleware/         # Auth, error handling, rate limiting, upload
│   │   ├── models/             # Mongoose schemas (Certification, Project, User)
│   │   ├── routes/             # RESTful API Route definitions
│   │   ├── seed/               # Idempotent database seeding scripts
│   │   ├── services/           # Business logic & 3rd-party integrations
│   │   └── index.js            # Server entry point
│   └── package.json
└── README.md                   # Project Documentation
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** `>= 18.x`
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/Hamza-Idiris/my-Portfolio.git
cd my-Portfolio
```

### 3. Server Configuration & Run
```bash
cd server
cp .env.example .env
npm install
npm run seed     # Pre-populate skills, projects, and certifications
npm run dev      # Server starts on http://localhost:5000
```

### 4. Client Configuration & Run
```bash
cd ../client
cp .env.example .env
npm install
npm run dev      # Client runs on http://localhost:5173
```

---

## 📡 API Endpoint Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/certifications` | **Public** | Fetch all published certifications |
| `POST` | `/api/certifications` | **Admin** | Create a new certification entry |
| `PUT` | `/api/certifications/:id` | **Admin** | Update certification details or assets |
| `DELETE`| `/api/certifications/:id` | **Admin** | Remove certification record |
| `GET` | `/api/projects` | **Public** | Fetch showcase portfolio projects |
| `POST` | `/api/projects` | **Admin** | Create portfolio project entry |
| `POST` | `/api/auth/login` | **Public** | Admin authentication & JWT issuing |
| `POST` | `/api/messages` | **Public** | Send inquiry message / contact form |

---

## 👨‍💻 Author & Contact

<div align="center">

**Hamza Idiris** — *Full-Stack Software Engineer*

[![Portfolio](https://img.shields.io/badge/Portfolio-hamzaidiris.dev-000000?style=for-the-badge&logo=google-chrome&logoColor=white)](https://hamzaidiris.dev)
[![GitHub](https://img.shields.io/badge/GitHub-Hamza--Idiris-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Hamza-Idiris)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com)
[![Email](https://img.shields.io/badge/Email-hamza%40hamzaidiris.dev-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hamza@hamzaidiris.dev)

</div>

---

<div align="center">
  <sub>Designed & Developed with ❤️ by <a href="https://github.com/Hamza-Idiris">Hamza Idiris</a>. Licensed under MIT.</sub>
</div>

<!-- sync-log-entry-1 -->
<!-- sync-log-entry-2 -->
<!-- sync-log-entry-3 -->
<!-- sync-log-entry-4 -->
<!-- sync-log-entry-5 -->
<!-- sync-log-entry-6 -->
<!-- sync-log-entry-7 -->
<!-- sync-log-entry-8 -->
<!-- sync-log-entry-9 -->
<!-- sync-log-entry-10 -->
<!-- sync-log-entry-11 -->
<!-- sync-log-entry-12 -->
<!-- sync-log-entry-13 -->
<!-- sync-log-entry-14 -->
<!-- sync-log-entry-15 -->
<!-- sync-log-entry-16 -->
<!-- sync-log-entry-17 -->
<!-- sync-log-entry-18 -->
<!-- sync-log-entry-19 -->
<!-- sync-log-entry-20 -->
<!-- sync-log-entry-21 -->
<!-- sync-log-entry-22 -->
<!-- sync-log-entry-23 -->
<!-- sync-log-entry-24 -->
<!-- sync-log-entry-25 -->
<!-- sync-log-entry-26 -->
<!-- sync-log-entry-27 -->
<!-- sync-log-entry-28 -->
<!-- sync-log-entry-29 -->
<!-- sync-log-entry-30 -->
<!-- activity-sync-1790418875478-0 -->
<!-- activity-sync-1790418875780-1 -->