# Frontend API Integration Guide & Developer Cheatsheet

Welcome! The frontend codebase has been organized into clean, typed service modules under `src/api/`, state contexts under `src/context/`, and categorized components under `src/components/`. 

When building new frontend screens or pages, **you never need to write raw `fetch()` requests or manage URL paths manually**. Everything is handled automatically.

---

## 1. Quick Start: Importing the API

```javascript
import { coursesApi, learnerApi, adminApi } from './api';
```

---

## 2. Available API Services

### 📘 Courses API (`coursesApi`)

| Method | Parameters | Description | Returns |
| :--- | :--- | :--- | :--- |
| `coursesApi.getAll(adminToken?)` | `adminToken` *(optional)* | Fetch all published courses (or drafts if admin token is passed) | `{ success, courses: [...] }` |
| `coursesApi.getById(courseId, adminToken?)` | `courseId` *(string)* | Fetch a course with its full Master Summary & 15 MCQs | `{ success, course: { ... } }` |
| `coursesApi.submitQuiz(courseId, payload)` | `courseId`, `payload` *(object)* | Submit quiz answers for automated AI Bloom's evaluation | `{ success, submission, profile }` |
| `coursesApi.getSubmissions(courseId?)` | `courseId` *(optional)* | Get all past submissions for a specific course or all | `{ success, submissions: [...] }` |

#### Example: How to render a course in a new component
```jsx
import React, { useEffect, useState } from 'react';
import { coursesApi } from '../api';

export default function MyCustomCourseView({ courseId }) {
  const [course, setCourse] = useState(null);

  useEffect(() => {
    coursesApi.getById(courseId).then(data => setCourse(data.course));
  }, [courseId]);

  if (!course) return <div>Loading...</div>;
  return <h2>{course.title}</h2>;
}
```

---

### 👤 Learner API (`learnerApi`)

| Method | Parameters | Description | Returns |
| :--- | :--- | :--- | :--- |
| `learnerApi.login(phone, name, email)` | `phone`, `name`, `email` | Authenticates or registers a learner | `{ success, user: { phone, name, email } }` |
| `learnerApi.getProfile(phone)` | `phone` *(string)* | Get learner profile, past submissions & cumulative analysis | `{ success, user, submissions, cumulativeAnalysis }` |
| `learnerApi.generateCumulativeAnalysis(phone)` | `phone` *(string)* | Trigger the AI agent to synthesize a cross-test growth report | `{ success, cumulativeAnalysis, profile }` |

#### Example: How to authenticate in a custom modal
```javascript
import { learnerApi } from '../api';

const handleLogin = async (phone, name, email) => {
  const result = await learnerApi.login(phone, name, email);
  console.log('Logged in learner:', result.user);
};
```

---

### 🛡️ Admin API (`adminApi`)

All protected administrative operations require the `adminToken` (stored in `sessionStorage.sih_admin_token`).

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `adminApi.login(user, pass)` | `username`, `password` | Admin authentication |
| `adminApi.ingestCourse(courseId, title, token)` | `courseId`, `title`, `token` | Trigger autonomous crawler & MCQ generation |
| `adminApi.updateCourse(courseId, data, token)` | `courseId`, `data`, `token` | Edit master summary, question text, or status |
| `adminApi.deleteCourse(courseId, token)` | `courseId`, `token` | Remove course from database |
| `adminApi.getStats(token)` | `token` | Get database telemetry (learners, submissions, courses) |
| `adminApi.listAdmins(token)` | `token` | Get all authorized admin usernames and emails |
| `adminApi.createAdmin(data, token)` | `{ username, email, password }`, `token` | Provision a new admin |
| `adminApi.updateProfile(data, token)` | `{ email, newPassword }`, `token` | Update logged-in admin's credentials |

---

## 3. Directory Layout Overview

```
src/
├── api/                   # All network calls (coursesApi, learnerApi, adminApi)
├── context/               # Global state (useLearner, useAdmin)
├── components/
│   ├── common/            # Reusable UI primitives (Navbar, LoadingState)
│   ├── learner/           # Public learner components (Catalog, Quiz, Dashboard)
│   ├── admin/             # Secure admin components (Portal, Ingestion, Customizer)
│   └── index.js           # Universal component barrel export
├── config.js              # Centralized environment config (VITE_API_BASE_URL)
├── App.jsx                # Routing & view dispatcher
└── main.jsx
```

---

## 4. How to Import Components Easily

You can import any component directly from `./components`:
```jsx
import { 
  Navbar, 
  CourseCatalog, 
  Quiz, 
  AnalysisDashboard, 
  AdminPortal 
} from './components';
```
