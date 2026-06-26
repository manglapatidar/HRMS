# NovaHR — HR Management System (HRMS)

## Overview

NovaHR is a full-stack, multi-tenant Human Resource Management System designed to manage the complete employee lifecycle — from onboarding to exit — for organizations of any size. It is built on the MERN stack (MongoDB, Express.js, React, Node.js) and follows a modular, role-based architecture similar to commercial platforms like BambooHR, Keka, and Zoho People.

The system is **multi-tenant**, meaning multiple companies can use the same deployed application while their data remains completely isolated from one another. Every database record is scoped to a `tenantId`, ensuring one company can never access another's data — even though they share the same underlying infrastructure.

## Why This Project Exists

Manual HR processes — tracking attendance on spreadsheets, approving leave over email, maintaining employee records in scattered documents — do not scale as a company grows. NovaHR centralizes these processes into a single system where:

- HR teams get a single source of truth for all employee data
- Employees and managers can self-serve common requests (leave, attendance corrections) without needing HR's direct involvement for every action
- Approvals follow a structured, auditable workflow instead of informal communication
- Leadership gets real-time visibility into workforce metrics without manually compiling reports

## How the System is Organized

### Multi-Tenancy

Each company that signs up becomes a "tenant." All data — employees, attendance records, leave requests, policies — is tagged with that tenant's unique ID. Every API request is scoped to the logged-in user's tenant, so data never leaks across companies. This is what allows one deployment of NovaHR to serve many independent organizations simultaneously.

### Role-Based Access Control (RBAC)

The system defines four roles, structured as a hierarchy where each role inherits the capabilities of the role below it:

1. **Employee** — the base role. Manages their own profile, marks their own attendance, and applies for their own leave.
2. **Manager** — everything an Employee can do, plus oversight of their direct reports. Managers approve or reject leave and attendance correction requests from their team, and view team-level reports.
3. **HR Admin** — the system administrator role for a tenant. HR Admin configures the organization's structure (departments, designations, locations, shifts, holidays), defines leave policies, manages all employee records, and has full company-wide reporting visibility.
4. **Leadership** — a read-only, organization-wide analytics role intended for executives. Leadership can view company-wide dashboards and the full employee directory but cannot approve requests or edit any data — their function is oversight and decision support, not operational management.

This hierarchy is enforced both in the user interface (different roles see different navigation and pages) and at the API level (the backend independently verifies that a request is allowed for that role and scoped to the right data — a Manager's API calls only return their own team's data, regardless of what the frontend requests).

### Core Functional Modules

**Organization & Employee Management** establishes the company's structure — departments, designations, and locations — and maintains the master record for every employee, including their reporting relationships, which forms the basis for an organization chart.

**Attendance Management** captures daily attendance through a punch in/out mechanism. Each employee is assigned a shift (a configured start time, end time, and grace period), and the system automatically calculates whether a punch counts as on-time, late, or a half-day. If an employee forgets to punch or punches incorrectly, they can submit a regularization request, which their manager reviews and approves before the record is corrected — this prevents employees from freely editing their own attendance history while still allowing genuine mistakes to be fixed.

**Leave Management** is built around configurable leave policies set by HR Admin — for example, a fixed number of Casual and Sick leave days per year. Employees apply against their balance, and the system blocks requests that would exceed it, with one exception: Loss of Pay (LOP) leave, which has no balance limit since it corresponds to an unpaid day rather than a benefit being consumed. Leave requests longer than a configured threshold require a second level of approval from HR Admin even after the manager approves, reflecting how organizations often want additional oversight for extended absences.

**The Approval Workflow Engine** is a shared mechanism used by both leave and attendance regularization requests, rather than two separate systems. It supports delegation — allowing a manager who will be unavailable to temporarily hand off their approval authority to another manager or HR Admin — and automatic escalation, where a request that remains unactioned past a defined time window is flagged and surfaced to a higher-level approver.

**Reporting and Dashboards** are scoped by role: an Employee sees only their own summary, a Manager sees aggregated data for their team, and HR Admin and Leadership see organization-wide figures. Dedicated reports calculate overtime (hours worked beyond an employee's shift duration) and attrition (the rate at which employees are exiting the organization over a given period).

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React (Vite) | Single-page application UI |
| Routing | React Router | Client-side navigation |
| Styling | Tailwind CSS | Utility-first styling system |
| Animation | Framer Motion | Page transitions and micro-interactions |
| Data Visualization | Recharts | Dashboard charts and analytics |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Document storage and schema modeling |
| Authentication | JSON Web Tokens (JWT) | Stateless session management |
| File Uploads | Multer | Profile photo and document handling |

## Project Structure

```
HRMS/
├── backend/
│   ├── controllers/     -> business logic for each module
│   ├── models/           -> Mongoose schemas (Employee, Attendance, Leave, etc.)
│   ├── routes/            -> API endpoint definitions
│   ├── middleware/      -> authentication, authorization, and tenant scoping
│   ├── seed/                -> demo data generation script
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/         -> role-specific dashboard pages
│   │   ├── components/  -> reusable UI elements
│   │   └── api/             -> centralized API client
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v18 or higher
- A MongoDB instance (local installation or a MongoDB Atlas connection string)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Seeding Demo Data

To populate a demo tenant with sample users across all four roles and representative attendance/leave data:

```bash
cd backend
npm run seed
```

## Summary of Role Capabilities

| Capability | Employee | Manager | HR Admin | Leadership |
|---|:---:|:---:|:---:|:---:|
| Manage own profile, attendance, leave | Yes | Yes | Yes | Yes |
| Approve team's leave/regularization requests | No | Yes | Yes | No |
| Manage employee records and org structure | No | No | Yes | No |
| Configure leave policies, shifts, holidays | No | No | Yes | No |
| View team-level reports | No | Yes | Yes | No |
| View organization-wide reports and directory | No | No | Yes | Yes |

## License

Developed as part of an academic/training assignment.