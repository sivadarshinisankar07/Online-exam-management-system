# ExamPortal — Online Examination Management System

A production-grade SaaS-like platform built with **Spring Boot**, **MongoDB Atlas**, and **React + Vite**.

## Features

- 🔐 JWT-based authentication (Admin & Student roles)
- 📋 Exam creation wizard with question management
- ⏱ Full-screen timed exam interface with auto-save
- 🚩 Tab-switch detection & anti-cheating tracking
- 📡 Live exam monitoring dashboard (real-time)
- 📊 Results with publish/unpublish control
- 🏆 Leaderboard with podium display
- ❓ Reusable Question Bank

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Backend   | Spring Boot 3.2, Java 17 |
| Database  | MongoDB Atlas           |
| Auth      | JWT (JJWT 0.12)         |
| Frontend  | React 18 + Vite 4       |
| Styling   | Vanilla CSS (dark SaaS) |

## Getting Started

### Backend

```bash
cd backend

# Copy and configure your credentials
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
# Edit application.properties with your MongoDB URI and JWT secret

mvn spring-boot:run
# Runs on http://localhost:8081
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Demo Credentials

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Admin   | admin@exam.com     | admin123   |
| Student | student@exam.com   | student123 |

> These are auto-seeded on first boot if the DB is empty.

## Project Structure

```
exam-system/
├── backend/    ← Spring Boot Maven project
└── frontend/   ← React (Vite) project
```
