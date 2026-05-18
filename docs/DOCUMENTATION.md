# WorkNest - Comprehensive HR System for Businesses

> **Note.** This is the legacy long-form project documentation,
> translated from Polish on 2026-05-16. For up-to-date material on
> engineering decisions, see [`docs/adr/`](adr/). For setup and
> workflow, see the [`README`](../README.md) and
> [`CONTRIBUTING`](../CONTRIBUTING.md).

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Goals](#project-goals)
3. [Target Audience](#target-audience)
4. [Features](#features)
5. [System Architecture](#system-architecture)
6. [Roles on the Project](#roles-on-the-project)
7. [Project Timeline](#project-timeline)
8. [MERN Technology Stack](#mern-technology-stack)
9. [Success Metrics](#success-metrics)
10. [Roadmap](#roadmap)

---

## Project Overview

**Name:** WorkNest - All-in-One HR Management System

**Tagline:** "Your Human Resources Management Hub"

**Description:**
WorkNest is a modern, comprehensive HR platform designed for small and medium businesses (10-500 employees). The system digitises every HR process - from recruitment, onboarding, and leave management, through to performance reviews, payroll, and HR analytics. Built entirely on the MERN stack (MongoDB, Express.js, React.js, Node.js), it offers an intuitive interface and powerful automation features.

**The Problem It Solves:**

**Current pain points at companies:**

- HR tooling scattered across Excel, email and paper
- No central employee database
- Time-consuming administrative work
- Difficulty tracking leave requests and absences
- Chaos in the recruitment process
- Lack of analytics and reporting
- Inefficient internal communication
- Compliance and documentation headaches

**The Solution:**

**WorkNest offers:**

- A single system for every HR workflow
- Automation of repetitive tasks
- A self-service portal for employees
- Real-time analytics and dashboards
- Mobile access 24/7
- Full regulatory compliance (GDPR, Polish Labour Code)
- Integrations with popular tools
- Scalability and security

---

## Project Goals

### Business Goals:

1. **Reduce HR Time by 60%**
   - Process automation
   - Elimination of paper documentation
   - Employee self-service

2. **300% ROI in the first year**
   - Time savings for the HR team
   - Fewer payroll errors
   - Lower recruitment costs

3. **40% Increase in Employee Satisfaction**
   - Faster access to information
   - Simpler processes
   - Clarity and transparency

4. **Acquire 100+ companies in 12 months**
   - B2B SaaS model
   - Monthly subscriptions
   - Multiple pricing tiers

5. **Net Promoter Score > 50**
   - High product quality
   - Excellent UX
   - Effective support

### Technical Goals:

1. **Performance and Scalability**
   - Support for 10,000+ concurrent users
   - Page load time < 1.5 seconds
   - API response time < 150ms
   - Horizontal scaling ready

2. **Security and Compliance**
   - GDPR compliance
   - End-to-end encryption
   - Multi-factor authentication (MFA)
   - Regular security audits
   - Backup and disaster recovery

3. **Availability**
   - 99.9% uptime SLA
   - Zero-downtime deployments
   - Load balancing
   - CDN for static assets

4. **User Experience**
   - Intuitive interface
   - Mobile-first approach
   - Accessibility (WCAG 2.1 AA)
   - Dark mode support
   - Multi-language (PL, EN)

5. **Integrations**
   - REST API for partners
   - Webhook system
   - SSO (Single Sign-On)
   - Integrations with Slack, Teams, Gmail
   - Data export/import (CSV, Excel)

### Product Goals:

1. **Time to Market: 6 months (MVP)**
2. **Customer Acquisition Cost (CAC) < $500**
3. **Churn Rate < 5% per month**
4. **Monthly Recurring Revenue (MRR) $50k in Year 1**
5. **Feature Adoption Rate > 70%**

---

## Target Audience

### Primary Segment: SMB (Small & Medium Business)

**1. Small Businesses (10-50 employees)**

- **Pain Points:**
  - No dedicated HR team
  - Owner/founder handles HR manually
  - Excel and Google Sheets
  - Documentation chaos

- **Needs:**
  - Simple, intuitive system
  - Affordable pricing
  - Fast onboarding
  - Basic HR features

- **Budget:** 50-200 PLN/month

**2. Medium Businesses (50-200 employees)**

- **Pain Points:**
  - Outdated HR systems
  - Tools that don't talk to each other
  - Time-consuming processes
  - Reporting headaches

- **Needs:**
  - Advanced features
  - Process automation
  - Analytics and reports
  - Multi-level permissions

- **Budget:** 500-2000 PLN/month

**3. Larger Organisations (200-500 employees)**

- **Pain Points:**
  - Complex organisational structures
  - Compliance and audits
  - ERP integrations
  - Scaling processes

- **Needs:**
  - Enterprise features
  - Customisation
  - Dedicated support
  - SLA guarantees

- **Budget:** 2000-10000 PLN/month

### User Personas:

**Persona 1: Marek - HR Manager (35)**

- Runs the HR team in a 150-person company
- Frustration: too much time on admin, not enough on strategy
- Tech-savvy, enjoys modern tools
- Expectations: automation, analytics, ease of use

**Persona 2: Anna - CEO of a small business (42)**

- Runs a 25-person company, handles HR herself
- Frustration: no time, document chaos
- Basic IT skills
- Expectations: simplicity, low cost, time savings

**Persona 3: Piotr - Employee (28)**

- Developer at a mid-sized IT firm
- Frustration: opaque processes, slow HR turnaround
- Digital native
- Expectations: self-service, mobile app, transparency

**Persona 4: Kasia - CFO (45)**

- Owns finance and payroll
- Frustration: payroll errors, missing reports
- Demands precision and compliance
- Expectations: accounting integration, accuracy

---

## Features

### 1. Core HR Module (Employee Management)

**Employee Database:**

- Central database of all employees
- Employee profiles with full data
  - Personal data (GDPR compliant)
  - Contact details
  - Contract data (type, position, salary)
  - Employment history
  - Documents (contracts, addenda, certificates)
  - Profile photo

- Organisational Chart
  - Interactive org chart
  - Company hierarchy
  - Department structure
  - Manager-employee relationships

- Employee Directory
  - Employee search
  - Filters and sorting
  - Contact cards
  - Status (active/inactive/on leave)

**Document Management:**

- Digital document repository
- E-signatures
- Automated contract generation
- Document versioning
- Notifications for expiring documents
- Secure storage (encrypted)

---

### 2. Recruitment Module (Recruitment & ATS)

**Applicant Tracking System:**

- Creating job postings
- Multi-channel posting (own site + LinkedIn, Pracuj.pl)
- Career page builder
- Application form
- CV parsing (automatic data extraction)

**Recruitment Pipeline:**

- Kanban board with recruitment stages
  - New applications
  - CV screening
  - Phone interview
  - Technical interview
  - Offer
  - Hired/Rejected

- Drag & drop candidate moves
- Notes and comments
- Candidate scorecards
- Email templates
- Interview scheduling

**Analytics:**

- Time to hire
- Source of hire
- Conversion rates
- Recruitment funnel
- Cost per hire

---

### 3. Time & Attendance Module

**Working-time System:**

- Time clock (punch in/out)
- Timesheet tracking
- GPS location tracking (mobile)
- Overtime tracking
- Break management
- Shift scheduling

**Leave and Absences:**

- Employee self-service portal
- Online leave requests
- Multi-level approval workflow
- Different leave types:
  - Annual leave
  - On-demand leave
  - Sick leave (L4)
  - Childcare leave
  - Compassionate leave
  - Unpaid leave

- Team calendar (who's on leave)
- Balance tracking (days remaining)
- Automatic accrual
- Email notifications
- Conflict detection (e.g. too many people on leave)

**Calendars:**

- Personal calendar
- Team calendar
- Company calendar
- Holiday calendar
- Meeting scheduler
- Google Calendar / Outlook integration

---

### 4. Payroll & Benefits Module

**Salaries:**

- Payroll processing
- Salary calculator
- Tax calculations
- ZUS (social security) contributions
- Deductions management
- Bonuses & commissions
- Pay slip generation
- Bank transfer files (Elixir)

**Employee Self-Service:**

- Access to pay slips
- YTD earnings
- Tax documents (PIT)
- Benefit status
- Download/print options

**Benefits Management:**

- Benefit packages
- Health insurance
- Multisport card
- Meal vouchers
- Retirement plans
- Stock options
- Custom benefits

**Financial Reports:**

- Payroll reports
- Cost centre analysis
- Budget vs actual
- Tax reports
- Export for accounting

---

### 5. Onboarding & Offboarding Module

**Onboarding New Employees:**

- Customisable onboarding workflows
- Task checklists
  - For the new hire
  - For the manager
  - For HR
  - For IT

- Welcome package
- Company handbook
- Training materials
- Equipment assignment
- Access provisioning
- Buddy system
- 30-60-90 day plans

**Offboarding:**

- Exit interviews
- Knowledge transfer checklist
- Equipment return
- Access revocation
- Final paycheck calculation
- COBRA notifications
- Alumni network

---

### 6. Performance Management Module

**Performance Reviews:**

- Performance review cycles
- 360-degree feedback
- Self-assessment
- Manager assessment
- Peer reviews
- Goal setting (OKRs / KPIs)
- Rating scales
- Competency matrix

**One-on-Ones:**

- Meeting templates
- Agenda builder
- Notes & action items
- Meeting history
- Feedback log

**Development Plans:**

- Individual development plans (IDP)
- Career paths
- Skill gap analysis
- Training recommendations
- Succession planning

**Recognition & Rewards:**

- Peer recognition
- Badges & achievements
- Points system
- Leaderboards
- Reward redemption

---

### 7. Learning & Development Module

**Training Management:**

- Course catalogue
- Training calendar
- Enrolment system
- Attendance tracking
- Certificates
- Training budget tracking

**E-Learning:**

- LMS (Learning Management System)
- Video courses
- Quizzes & assessments
- Progress tracking
- Completion certificates
- Mobile learning

**Compliance Training:**

- Mandatory trainings
- Deadline tracking
- Automated reminders
- Compliance reports
- Audit trail

---

### 8. Communication & Engagement Module

**Internal Communication:**

- Company news feed
- Announcements
- Polls & surveys
- Comments & reactions
- @mentions
- Department channels

**Employee Engagement:**

- Pulse surveys
- eNPS tracking
- Sentiment analysis
- Anonymous feedback
- Suggestion box
- Action plans

**Social Features:**

- Employee profiles
- Birthday/anniversary reminders
- Company events
- Photo galleries
- Social wall

---

### 9. Analytics & Reporting Module

**HR Dashboards:**

- Executive dashboard
- HR manager dashboard
- Department dashboards
- Real-time metrics
- Customisable widgets

**Key HR Metrics:**

- Headcount & demographics
- Turnover rate
- Time to hire
- Absenteeism
- Training hours
- Performance ratings distribution
- Salary benchmarking
- Cost per employee
- Diversity & inclusion metrics

**Custom Reports:**

- Report builder
- Saved reports
- Scheduled reports (email)
- Export formats (PDF, Excel, CSV)
- Data visualisation (charts, graphs)

**Predictive Analytics:**

- Turnover prediction
- Flight risk indicators
- Workforce planning
- Talent pipeline

---

### 10. Administration & Settings Module

**Company Settings:**

- Company profile
- Departments & locations
- Working hours
- Holiday calendar
- Email templates
- Branding (logo, colours)

**User Management:**

- User roles & permissions
- Access control (RBAC)
- Multi-level hierarchy
- Delegation
- Audit logs

**Integrations:**

- Slack
- Microsoft Teams
- Google Workspace
- Zoom
- LinkedIn
- Accounting software
- SSO (SAML, OAuth)

**API & Webhooks:**

- RESTful API
- API documentation
- Webhook events
- Rate limiting
- API key management

---

## System Architecture (MERN)

### Stack Overview:

```
+-----------------------------------------+
|           CLIENT LAYER                  |
|  React.js + Redux + Material-UI         |
|  (Progressive Web App - PWA)            |
+-----------------------------------------+
                    v
+-----------------------------------------+
|         API GATEWAY LAYER               |
|       Node.js + Express.js              |
|    (RESTful API + WebSocket)            |
+-----------------------------------------+
                    v
+-----------------------------------------+
|       BUSINESS LOGIC LAYER              |
|   Controllers + Services + Utils        |
+-----------------------------------------+
                    v
+-----------------------------------------+
|         DATABASE LAYER                  |
|      MongoDB + Mongoose ODM             |
|    (Atlas Cloud / Self-hosted)          |
+-----------------------------------------+
                    v
+-----------------------------------------+
|       EXTERNAL SERVICES                 |
|  AWS S3, SendGrid, Stripe, etc.         |
+-----------------------------------------+
```

> Multi-tenancy note: the current implementation enforces company isolation at the data layer (per-tenant scoping on every model query) and exposes a separate demo sandbox for read-only previews. See [`docs/adr/`](adr/) for the relevant decisions.

### Detailed Architecture:

#### **Frontend (React.js)**

```javascript
// Frontend project structure
worknest-frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── common/          // Reusable components
│   │   ├── layout/          // Layout components
│   │   ├── employees/       // Employee components
│   │   ├── recruitment/     // ATS components
│   │   ├── attendance/      // Time & attendance
│   │   ├── payroll/         // Payroll components
│   │   └── performance/     // Performance mgmt
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── Terms.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   └── ...
│   ├── redux/
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── employeeSlice.js
│   │   │   └── ...
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── ...
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   └── ...
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   └── index.js
└── package.json
```

**Frontend Tech Stack:**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "redux": "^4.2.1",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.1.2",
    "axios": "^1.5.0",
    "@mui/material": "^5.14.10",
    "@mui/icons-material": "^5.14.9",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "formik": "^2.4.4",
    "yup": "^1.3.2",
    "react-query": "^3.39.3",
    "socket.io-client": "^4.7.2",
    "react-dropzone": "^14.2.3",
    "react-datepicker": "^4.18.0",
    "react-hot-toast": "^2.4.1",
    "jwt-decode": "^3.1.2"
  }
}
```

> Storybook is set up for visual review of the design system. Playwright drives end-to-end tests; Lighthouse CI runs against the built bundle in pull requests.

#### **Backend (Node.js + Express.js)**

```javascript
// Backend project structure
worknest-backend/
├── src/
│   ├── config/
│   │   ├── db.js              // MongoDB connection
│   │   ├── env.js             // Environment variables
│   │   └── passport.js        // Authentication config
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Leave.js
│   │   ├── Attendance.js
│   │   ├── Payroll.js
│   │   ├── Recruitment.js
│   │   └── Performance.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── leaveController.js
│   │   ├── attendanceController.js
│   │   ├── payrollController.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js            // JWT verification
│   │   ├── roleCheck.js       // RBAC middleware
│   │   ├── validation.js      // Request validation
│   │   ├── errorHandler.js    // Error handling
│   │   └── rateLimiter.js     // Rate limiting
│   ├── services/
│   │   ├── emailService.js
│   │   ├── pdfService.js
│   │   ├── storageService.js
│   │   ├── notificationService.js
│   │   └── payrollService.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── logger.js
│   ├── jobs/
│   │   ├── cronJobs.js        // Scheduled tasks
│   │   └── emailQueue.js      // Background jobs
│   └── server.js              // Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── package.json
└── README.md
```

**Backend Tech Stack:**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.5",
    "pdfkit": "^0.13.0",
    "node-cron": "^3.0.2",
    "bull": "^4.11.4",
    "socket.io": "^4.7.2",
    "winston": "^3.10.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "swagger-ui-express": "^5.0.0",
    "joi": "^17.10.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "eslint": "^8.49.0"
  }
}
```

> Live API documentation is served via Swagger UI (OpenAPI). Structured logging is emitted via Winston with request correlation IDs; Socket.IO powers real-time notifications.

#### **Database (MongoDB)**

**Schema Design Examples:**

```javascript
// Employee Model
const employeeSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Employment Information
    employeeId: { type: String, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    position: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    hireDate: Date,
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Intern"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Terminated"],
      default: "Active",
    },

    // Compensation
    salary: {
      amount: Number,
      currency: { type: String, default: "PLN" },
      frequency: { type: String, enum: ["Monthly", "Hourly"] },
    },

    // Leave Balance
    leaveBalance: {
      annual: { type: Number, default: 20 },
      sick: { type: Number, default: 10 },
      personal: { type: Number, default: 5 },
    },

    // Documents
    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadDate: Date,
      },
    ],

    // Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Leave Request Model
const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Annual", "Sick", "Personal", "Maternity", "Paternity", "Unpaid"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: String,
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: Date,
    comments: String,
  },
  {
    timestamps: true,
  },
);
```

> Sensitive personal identifiers (e.g. PESEL) are stored encrypted at rest. Deletions are soft deletes by default to preserve audit history; hard deletion happens only via a scheduled purge job.

### Security Implementation:

```javascript
// JWT Authentication
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Password Hashing
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

// Role-Based Access Control (RBAC)
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};
```

> The current implementation issues a short-lived JWT access token alongside a refresh cookie; see the ADRs for the rationale behind that split.

---

## Roles on the Project

As a **Solo Full-Stack Developer** running the WorkNest project on the MERN stack, you wear **every hat**:

### Your Main Roles:

#### 1. **Product Owner & Business Analyst**

**Time: 15% of the project**

**Responsibilities:**

- Defining the WorkNest product vision
- Building the roadmap
- Competitor analysis (BambooHR, Personio, Calamari)
- Setting the MVP and priorities
- User research and feedback

**Weekly Tasks:**

- Backlog grooming (2h)
- Usage metrics review (1h)
- Competitor research (1h)
- Planning the next features (2h)

**Tools:**

- Notion / Trello (Product Backlog)
- Google Analytics
- Hotjar (User Behaviour)
- SimilarWeb (Competitor Analysis)

---

#### 2. **UX/UI Designer**

**Time: 10% of the project**

**Responsibilities:**

- Designing the entire WorkNest interface
- Building the design system
- User flows and wireframes
- Responsive design
- Accessibility

**Workflow:**

1. **Research** → Competitor analysis, best practices
2. **Wireframing** → Layout sketches (Figma)
3. **Design** → High-fidelity mockups
4. **Prototyping** → Interactive prototypes
5. **Implementation** → React coding

**Tools:**

- Figma (Design & Prototyping)
- Material-UI (Component Library)
- Coolors (Colour Palettes)
- Google Fonts

**Your Design System:**

```javascript
// theme.js - WorkNest Theme
export const theme = {
  colors: {
    primary: "#2563eb", // Blue
    secondary: "#10b981", // Green
    accent: "#f59e0b", // Amber
    danger: "#ef4444", // Red
    dark: "#1f2937",
    light: "#f9fafb",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    body: { fontSize: "1rem", lineHeight: 1.5 },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
};
```

---

#### 3. **Frontend Developer (React.js)**

**Time: 35% of the project**

**Responsibilities:**

- Building the entire UI in React
- State management (Redux)
- API integration
- Routing and navigation
- Forms and validation
- Real-time updates (Socket.IO)
- PWA implementation

**Key Components to Build:**

```javascript
// Sketch of the main components

// 1. Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <StatsCards stats={stats} />
      <Charts />
      <RecentActivities activities={recentActivities} />
      <QuickActions />
    </DashboardLayout>
  );
};

// 2. Employee List Component
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  return (
    <Container>
      <SearchBar onSearch={handleSearch} />
      <FilterPanel filters={filters} onChange={setFilters} />
      <DataTable
        data={employees}
        columns={columns}
        onRowClick={handleRowClick}
      />
      <Pagination {...pagination} onChange={setPagination} />
    </Container>
  );
};

// 3. Leave Request Form
const LeaveRequestForm = () => {
  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(leaveSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/leaves", data);
      toast.success("Leave request submitted!");
      navigate("/leaves");
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DateRangePicker {...register("dates")} />
      <Select {...register("leaveType")} options={leaveTypes} />
      <TextArea {...register("reason")} />
      <Button type="submit">Submit Request</Button>
    </form>
  );
};
```

**Weekly Tasks:**

- New feature development (25h)
- Bug fixing (5h)
- Code refactoring (3h)
- Testing (2h)

---

#### 4. **Backend Developer (Node.js + Express)**

**Time: 30% of the project**

**Responsibilities:**

- REST API design
- Business logic implementation
- Database design and optimisation
- Authentication & Authorisation
- Third-party integrations
- Background jobs
- API documentation

**Key API Endpoints:**

```javascript
// API Routes Structure

// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

// Employees
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/:id/timeline
POST   /api/employees/bulk-import

// Departments
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id

// Leave Management
GET    /api/leaves
GET    /api/leaves/:id
POST   /api/leaves
PUT    /api/leaves/:id/approve
PUT    /api/leaves/:id/reject
DELETE /api/leaves/:id
GET    /api/leaves/calendar
GET    /api/leaves/balance/:employeeId

// Attendance
POST   /api/attendance/clock-in
POST   /api/attendance/clock-out
GET    /api/attendance/today
GET    /api/attendance/employee/:id
GET    /api/attendance/report

// Payroll
GET    /api/payroll
POST   /api/payroll/process
GET    /api/payroll/:id
GET    /api/payroll/employee/:id
POST   /api/payroll/payslip/:id/generate

// Recruitment
GET    /api/jobs
POST   /api/jobs
PUT    /api/jobs/:id
GET    /api/applications
POST   /api/applications
PUT    /api/applications/:id/status

// Performance
GET    /api/reviews
POST   /api/reviews
PUT    /api/reviews/:id
GET    /api/goals
POST   /api/goals

// Analytics
GET    /api/analytics/dashboard
GET    /api/analytics/turnover
GET    /api/analytics/headcount
GET    /api/reports/custom
```

**Controller Example:**

```javascript
// employeeController.js
const Employee = require("../models/Employee");

// Get all employees with pagination and filters
exports.getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 20, department, status, search } = req.query;

    // Build query
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    // Execute query with pagination
    const employees = await Employee.find(query)
      .populate("department", "name")
      .populate("manager", "firstName lastName")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Generate employee ID
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    const lastId = lastEmployee
      ? parseInt(lastEmployee.employeeId.slice(2))
      : 0;
    employeeData.employeeId = `WN${(lastId + 1).toString().padStart(4, "0")}`;

    // Create employee
    const employee = new Employee(employeeData);
    await employee.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(employee);

    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

**Weekly Tasks:**

- API development (20h)
- Database optimisation (3h)
- Integration work (5h)
- Documentation (2h)

---

#### 5. **Database Administrator (MongoDB)**

**Time: 5% of the project**

**Responsibilities:**

- Schema design
- Indexing strategy
- Query optimisation
- Backup & recovery
- Data migrations
- Performance monitoring

**MongoDB Best Practices:**

```javascript
// Indexing Strategy
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ firstName: "text", lastName: "text" });

// Compound indexes for common queries
employeeSchema.index({ department: 1, hireDate: -1 });
leaveSchema.index({ employee: 1, startDate: -1 });

// Query Optimisation Examples
// Bad
const employees = await Employee.find().populate("department");

// Good
const employees = await Employee.find()
  .populate("department", "name") // Only needed fields
  .select("firstName lastName email position") // Projection
  .lean(); // Convert to plain JS object

// Aggregation for complex reports
const departmentStats = await Employee.aggregate([
  { $match: { status: "Active" } },
  {
    $group: {
      _id: "$department",
      count: { $sum: 1 },
      avgSalary: { $avg: "$salary.amount" },
    },
  },
  {
    $lookup: {
      from: "departments",
      localField: "_id",
      foreignField: "_id",
      as: "departmentInfo",
    },
  },
]);
```

**Backup Strategy:**

- Daily automated backups (MongoDB Atlas)
- Point-in-time recovery
- Weekly backup testing
- 30-day retention policy

---

#### 6. **DevOps Engineer**

**Time: 5% of the project**

**Responsibilities:**

- Deployment automation
- Server management
- CI/CD pipeline
- Monitoring & logging
- Security patches
- Performance optimisation

**Deployment Setup:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Run tests
        run: |
          cd backend && npm test

      - name: Build frontend
        run: |
          cd frontend && npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/worknest
            git pull
            npm install
            pm2 restart all
```

**Server Infrastructure:**

```
Production Environment:
- Frontend: Vercel / Netlify
- Backend: DigitalOcean Droplet / AWS EC2
- Database: MongoDB Atlas
- File Storage: AWS S3
- CDN: CloudFlare
- Email: SendGrid
- Monitoring: Sentry + LogRocket
```

---

## Project Timeline (Solo Developer)

### Realistic 6-Month Plan (MVP)

#### **Month 1: Foundation & Core Setup** (160h)

**Weeks 1-2: Planning & Design (80h)**

- Market research (8h)
- Competitor analysis (8h)
- Feature prioritisation (8h)
- Database schema design (12h)
- Wireframing in Figma (16h)
- UI Design (20h)
- Design system (8h)

**Weeks 3-4: Project Setup (80h)**

- Repository setup (4h)
- Frontend boilerplate (React + Redux) (12h)
- Backend boilerplate (Node + Express) (12h)
- MongoDB connection & models (16h)
- Authentication system (JWT) (20h)
- Basic routing (8h)
- CI/CD setup (8h)

---

#### **Month 2: Core HR Module** (160h)

**Employee Management (80h)**

- Employee CRUD operations (24h)
- Employee profile page (16h)
- Department management (12h)
- Organisational chart (16h)
- Document upload (12h)

**User Management (80h)**

- Role-based access control (20h)
- User permissions (16h)
- Profile settings (12h)
- Company settings (12h)
- Email notifications (20h)

---

#### **Month 3: Time & Attendance** (160h)

**Leave Management (100h)**

- Leave request form (20h)
- Approval workflow (24h)
- Leave calendar (20h)
- Balance tracking (16h)
- Email notifications (12h)
- Reports (8h)

**Attendance System (60h)**

- Clock in/out functionality (20h)
- Timesheet view (16h)
- Attendance reports (16h)
- Mobile responsiveness (8h)

---

#### **Month 4: Recruitment & Payroll** (160h)

**Recruitment ATS (80h)**

- Job posting (16h)
- Application form (12h)
- Candidate pipeline (Kanban) (24h)
- CV parsing (16h)
- Email templates (12h)

**Payroll Basics (80h)**

- Salary management (20h)
- Payslip generation (24h)
- Tax calculations (20h)
- Reports (16h)

---

#### **Month 5: Performance & Analytics** (160h)

**Performance Management (80h)**

- Review cycles (20h)
- Goal setting (16h)
- One-on-ones (16h)
- 360 feedback (20h)
- Reports (8h)

**Analytics & Dashboards (80h)**

- Executive dashboard (24h)
- HR metrics (20h)
- Custom reports (20h)
- Data visualisation (16h)

---

#### **Month 6: Polish & Launch** (160h)

**Testing & Bug Fixing (60h)**

- Manual testing (20h)
- Bug fixes (30h)
- Performance optimisation (10h)

**Documentation (40h)**

- User guides (16h)
- API documentation (12h)
- Video tutorials (12h)

**Launch Preparation (60h)**

- Marketing site (20h)
- Onboarding flow (16h)
- Production deployment (12h)
- Beta testing (12h)

---

### Weekly Schedule:

```
Monday-Friday: 40h/week
- Development: 6h/day
- Planning/Design: 1h/day
- Testing/QA: 1h/day

Optional:
Saturday: 4h - Bug fixing, optimisation
Sunday: Rest (important!)

Total: ~40-44h/week = 160-176h/month
```

---

## MERN Technology Stack - Details

### Complete Tech Stack:

```javascript
{
  "frontend": {
    "core": [
      "React 18.2.0",
      "React Router 6.16.0",
      "Redux Toolkit 1.9.5"
    ],
    "ui": [
      "Material-UI 5.14.0",
      "Emotion (CSS-in-JS)",
      "Recharts (Charts)",
      "React-Datepicker"
    ],
    "forms": [
      "Formik 2.4.4",
      "Yup (Validation)"
    ],
    "utilities": [
      "Axios 1.5.0",
      "date-fns 2.30.0",
      "socket.io-client 4.7.2",
      "react-dropzone 14.2.3",
      "jwt-decode 3.1.2",
      "react-hot-toast 2.4.1"
    ]
  },
  "backend": {
    "core": [
      "Node.js 18+",
      "Express.js 4.18.2"
    ],
    "database": [
      "MongoDB 7.0",
      "Mongoose 7.5.0"
    ],
    "authentication": [
      "JWT (jsonwebtoken 9.0.2)",
      "bcryptjs 2.4.3",
      "Passport.js 0.6.0"
    ],
    "utilities": [
      "Nodemailer 6.9.5",
      "PDFKit 0.13.0",
      "Multer 1.4.5",
      "node-cron 3.0.2",
      "Bull (Job Queue) 4.11.4"
    ],
    "security": [
      "Helmet 7.0.0",
      "express-rate-limit 7.0.0",
      "cors 2.8.5",
      "express-validator 7.0.1"
    ]
  },
  "devops": [
    "Docker",
    "GitHub Actions",
    "PM2",
    "Nginx"
  ],
  "monitoring": [
    "Winston (Logging)",
    "Morgan (HTTP Logging)",
    "Sentry (Error Tracking)"
  ],
  "testing": [
    "Jest 29.6.4",
    "Supertest 6.3.3",
    "React Testing Library",
    "Playwright (E2E)"
  ]
}
```

---

## Success Metrics

### Business Metrics (Year 1):

| Metric         | Target        | How to Measure                  |
| -------------- | ------------- | ------------------------------- |
| **MRR**        | $50,000       | Stripe dashboard                |
| **Customers**  | 100 companies | Database count                  |
| **Churn Rate** | < 5%/month    | Analytics                       |
| **CAC**        | < $500        | Marketing spend / new customers |
| **LTV**        | > $3,000      | Average customer lifetime value |
| **NPS**        | > 50          | Quarterly surveys               |

### Product Metrics:

| Metric               | Target        | Tool             |
| -------------------- | ------------- | ---------------- |
| **DAU/MAU**          | 40%+          | Google Analytics |
| **Feature Adoption** | 70%+          | Mixpanel         |
| **Time in App**      | 20min/day     | Analytics        |
| **Task Completion**  | 90%+          | User testing     |
| **Support Tickets**  | < 3% of users | Zendesk          |

### Technical Metrics:

| Metric            | Target  | Tool              |
| ----------------- | ------- | ----------------- |
| **Page Load**     | < 1.5s  | Lighthouse        |
| **API Response**  | < 150ms | Custom monitoring |
| **Uptime**        | 99.9%   | UptimeRobot       |
| **Error Rate**    | < 0.1%  | Sentry            |
| **Test Coverage** | > 80%   | Jest              |

---

## Roadmap - Future Features

### Q1 2026: Post-MVP Enhancements

- Mobile app (React Native)
- Chatbot support (AI)
- Advanced email automation
- Push notifications
- Multi-language (EN, DE, FR)

### Q2 2026: Advanced Features

- Advanced analytics (ML)
- LMS expansion
- Expense management
- Fleet management
- E-signature integration

### Q3 2026: Integrations

- Outlook/Gmail calendar sync
- LinkedIn integration
- Accounting software (QuickBooks)
- VoIP integration (Zoom, Teams)
- Bank integrations (payroll)

### Q4 2026: Enterprise Features

- Multi-company support
- SSO (SAML, LDAP)
- Custom workflows
- White-label solution
- Global compliance

---

## Business Model

### Pricing Tiers:

**Starter Plan - 99 PLN/month**

- Up to 10 employees
- Core HR + Leave Management
- Email support
- 5 GB storage

**Professional Plan - 299 PLN/month**

- Up to 50 employees
- All features
- Priority support
- 50 GB storage
- API access

**Enterprise Plan - Custom**

- Unlimited employees
- Dedicated account manager
- Custom integrations
- 99.9% SLA
- Unlimited storage

### Revenue Projections (Year 1):

```
Months 1-3: Beta (Free) -> 20 companies
Months 4-6: Early Access -> 50 companies x 150 PLN avg = 7,500 PLN/m
Months 7-9: Growth -> 75 companies x 200 PLN avg = 15,000 PLN/m
Months 10-12: Scale -> 100 companies x 250 PLN avg = 25,000 PLN/m

Total Year 1 MRR: ~25,000 PLN (~$6,000)
Total Year 1 ARR: ~300,000 PLN (~$72,000)
```

---

## Support & Maintenance

### Support Levels:

**Community Support (Free)**

- Knowledge base
- Community forum
- Email (48h response)

**Standard Support (included)**

- Email support (24h)
- Live chat (business hours)
- Phone support (callback)
- Training webinars

**Premium Support (Enterprise)**

- 24/7 support
- Dedicated account manager
- On-site training
- Custom development
- SLA guarantees

---

## Marketing Strategy

### Target Channels:

**1. Content Marketing**

- HR blog (SEO)
- Case studies
- Whitepapers
- YouTube tutorials
- LinkedIn posts

**2. Direct Sales**

- LinkedIn outreach
- Cold email campaigns
- Industry events
- HR conferences
- Webinars

**3. Partnerships**

- HR consultants
- Accounting firms
- Business coaches
- Co-working spaces
- Industry associations

**4. Paid Advertising**

- Google Ads (B2B keywords)
- LinkedIn Ads
- Facebook Ads
- Retargeting campaigns

### Launch Strategy:

```
Phase 1: Beta (Months 1-3)
- 20 beta users
- Tight feedback loop
- Free access in exchange for feedback

Phase 2: Early Access (Months 4-6)
- 50% discount for early adopters
- Referral programme
- Case study collection

Phase 3: Public Launch (Month 7+)
- Product Hunt launch
- PR campaign
- Full pricing live
- Affiliate programme
```

---

## Technical Documentation

### API Documentation (Swagger):

```javascript
// swagger.js
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "WorkNest API",
      version: "1.0.0",
      description: "Complete HR Management System API",
      contact: {
        name: "API Support",
        email: "api@worknest.com",
      },
    },
    servers: [
      {
        url: "https://api.worknest.com/v1",
        description: "Production server",
      },
      {
        url: "http://localhost:5000/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};
```

---

## Compliance & Security

### GDPR Compliance:

**Data Protection Measures:**

- Data encryption (AES-256)
- Secure password storage (bcrypt)
- Data minimisation
- Purpose limitation
- Storage limitation
- Right of access
- Right to erasure
- Right to data portability
- Data breach notification

### Security Best Practices:

```javascript
// Security Checklist

// Authentication & Authorisation
- JWT with expiration
- Password complexity requirements
- Multi-factor authentication (MFA)
- Session management
- Rate limiting
- Account lockout after failed attempts

// Data Protection
- HTTPS everywhere (SSL/TLS)
- Database encryption at rest
- Secure file uploads
- Input sanitisation
- SQL injection prevention
- XSS protection
- CSRF tokens

// Infrastructure
- Regular security audits
- Dependency updates
- Firewall configuration
- DDoS protection
- Regular backups
- Disaster recovery plan

// Monitoring
- Login attempt monitoring
- Suspicious activity detection
- Error logging (without sensitive data)
- Access logs
- Regular penetration testing
```

---

## Resources & Learning

### Recommended Learning Path:

**MERN Stack Mastery:**

1. **MongoDB University** (free courses)
2. **Node.js Documentation** (official)
3. **React Documentation** (official)
4. **Express.js Guide** (official)

**Advanced Topics:**

- MongoDB Performance Tuning
- React Performance Optimisation
- Node.js Best Practices
- Security in MERN Applications
- Microservices Architecture

**YouTube Channels:**

- Traversy Media
- Academind
- The Net Ninja
- Web Dev Simplified

**Books:**

- "Node.js Design Patterns"
- "Pro MERN Stack"
- "MongoDB: The Definitive Guide"
- "Learning React"

---

## Lessons Learned (Tips for Solo Devs)

### Do's:

1. **MVP First**: don't try to build everything at once
2. **Automation**: automate deployment and testing
3. **Documentation**: document code as you go
4. **Version Control**: commit often with meaningful messages
5. **User Feedback**: listen to users from day one
6. **Code Quality**: don't cut corners on code quality
7. **Breaks**: take regular breaks; avoid burnout
8. **Backup**: backup, backup, backup!

### Don'ts:

1. **Premature Optimisation**: don't optimise too early
2. **Feature Creep**: don't add features without validation
3. **Perfect Code**: don't wait for perfection - iterate
4. **Solo Everything**: outsource marketing/design when needed
5. **Ignore Testing**: don't skip tests because "there's no time"
6. **Over-Engineering**: keep it simple, stupid (KISS)
7. **Skip Documentation**: you'll thank yourself in six months
8. **Burn Out**: don't pull 80-hour weeks; it's not sustainable

---

## Pro Tips for the Solo MERN Developer

### 1. **Component Library - Build Once, Use Everywhere**

```javascript
// components/common/Button.jsx
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg font-semibold transition-all';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};

// Reuse everywhere:
<Button variant="primary" onClick={handleSubmit}>Save</Button>
<Button variant="danger" size="sm">Delete</Button>
```

### 2. **Custom Hooks - DRY Principle**

```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loading, login, logout };
};

// hooks/useEmployee.js
export const useEmployee = (id) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    const { data } = await api.get(`/employees/${id}`);
    setEmployee(data);
    setLoading(false);
  };

  const updateEmployee = async (updates) => {
    const { data } = await api.put(`/employees/${id}`, updates);
    setEmployee(data);
    toast.success("Updated successfully!");
  };

  return { employee, loading, updateEmployee };
};
```

### 3. **Error Handling - Centralised**

```javascript
// utils/errorHandler.js
export const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;

    switch (status) {
      case 400:
        toast.error(data.message || "Invalid request");
        break;
      case 401:
        toast.error("Please login again");
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      case 403:
        toast.error("Access denied");
        break;
      case 404:
        toast.error("Resource not found");
        break;
      case 500:
        toast.error("Server error. Please try again.");
        break;
      default:
        toast.error("Something went wrong");
    }
  } else if (error.request) {
    // Network error
    toast.error("Network error. Check your connection.");
  } else {
    toast.error(error.message);
  }

  // Log to Sentry in production
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error);
  }
};

// Use it like:
try {
  await api.post("/employees", data);
} catch (error) {
  handleError(error);
}
```

### 4. **API Service Layer - Organise Your Calls**

```javascript
// services/api/index.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// services/api/employeeService.js
export const employeeService = {
  getAll: (params) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/employees/bulk-import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// services/api/leaveService.js
export const leaveService = {
  getAll: (params) => api.get("/leaves", { params }),
  create: (data) => api.post("/leaves", data),
  approve: (id) => api.put(`/leaves/${id}/approve`),
  reject: (id, reason) => api.put(`/leaves/${id}/reject`, { reason }),
  getBalance: (employeeId) => api.get(`/leaves/balance/${employeeId}`),
};
```

### 5. **Environment Variables - Security First**

```javascript
// .env.example (commit to repo)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/worknest
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development

// .env (add to .gitignore - NEVER commit!)
# Your actual values here

// config/env.js
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME
  }
};
```

### 6. **Background Jobs - Don't Block the Main Thread**

```javascript
// jobs/emailQueue.js
const Queue = require("bull");
const emailService = require("../services/emailService");

const emailQueue = new Queue("email", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

// Process jobs
emailQueue.process(async (job) => {
  const { type, data } = job.data;

  switch (type) {
    case "welcome":
      await emailService.sendWelcomeEmail(data);
      break;
    case "leave-approved":
      await emailService.sendLeaveApproval(data);
      break;
    case "payslip":
      await emailService.sendPayslip(data);
      break;
    default:
      throw new Error("Unknown email type");
  }
});

// Add jobs
exports.addEmailJob = (type, data) => {
  emailQueue.add(
    { type, data },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );
};

// jobs/cronJobs.js
const cron = require("node-cron");
const Employee = require("../models/Employee");

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily leave accrual...");

  // Accrue leave for all active employees
  const employees = await Employee.find({ status: "Active" });

  for (const employee of employees) {
    const monthlyAccrual = 20 / 12; // 20 days per year
    employee.leaveBalance.annual += monthlyAccrual;
    await employee.save();
  }

  console.log("Leave accrual completed");
});

// Check for expiring documents
cron.schedule("0 9 * * 1", async () => {
  // Every Monday at 9 AM
  console.log("Checking expiring documents...");
  // Your logic here
});
```

### 7. **Logging Strategy - Know What's Happening**

```javascript
// utils/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "worknest-api" },
  transports: [
    // Write to files
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Console in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

module.exports = logger;

// Usage:
logger.info("User logged in", { userId: user.id });
logger.error("Failed to create employee", { error: err.message });
logger.warn("High memory usage", { memory: process.memoryUsage() });
```

### 8. **Testing Strategy - Don't Skip It!**

```javascript
// __tests__/employee.test.js
const request = require("supertest");
const app = require("../app");
const Employee = require("../models/Employee");

describe("Employee API", () => {
  let token;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password" });
    token = response.body.token;
  });

  afterEach(async () => {
    await Employee.deleteMany({ email: /test/ });
  });

  describe("POST /api/employees", () => {
    it("should create a new employee", async () => {
      const employeeData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.test@example.com",
        position: "Developer",
      };

      const response = await request(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${token}`)
        .send(employeeData)
        .expect(201);

      expect(response.body.employee).toHaveProperty("_id");
      expect(response.body.employee.firstName).toBe("John");
    });

    it("should return 400 for invalid data", async () => {
      const response = await request(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${token}`)
        .send({ firstName: "John" }) // Missing required fields
        .expect(400);
    });
  });

  describe("GET /api/employees", () => {
    it("should return paginated employees", async () => {
      const response = await request(app)
        .get("/api/employees?page=1&limit=10")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("employees");
      expect(response.body).toHaveProperty("totalPages");
    });
  });
});

// Frontend test example
// __tests__/EmployeeList.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeList from "../components/EmployeeList";

describe("EmployeeList", () => {
  it("renders employee list", async () => {
    render(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("filters employees by department", async () => {
    render(<EmployeeList />);

    const select = screen.getByLabelText("Department");
    userEvent.selectOptions(select, "Engineering");

    await waitFor(() => {
      expect(screen.queryByText("Marketing Manager")).not.toBeInTheDocument();
    });
  });
});
```

---

## Quick Start Guide

### Spinning Up the Project:

```bash
# 1. Clone repository
git clone https://github.com/yourname/worknest.git
cd worknest

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev

# 3. Setup Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm start

# 4. Setup MongoDB
# Option A: Local
mongod --dbpath /path/to/data

# Option B: MongoDB Atlas (recommended)
# Create free cluster at mongodb.com/atlas
# Copy connection string to .env

# 5. Seed Database (optional)
cd backend
npm run seed
```

### Folder Structure - Final:

```
worknest/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   ├── logs/
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Contact and Support

**Developer:**

- Email: developer@worknest.com
- GitHub: github.com/yourname/worknest
- LinkedIn: linkedin.com/in/yourname

**Product:**

- Website: worknest.com
- Demo: demo.worknest.com
- Status: status.worknest.com

**Community:**

- Discord: discord.gg/worknest
- Forum: community.worknest.com
- Twitter: @worknest

---

## Licence

Copyright (c) 2026 Szymon (WorkNest). All rights reserved. Proprietary and confidential.

---

## Summary

WorkNest is an **ambitious but doable project** for a solo MERN developer. Key points:

### Upsides of This Approach:

- **Full control** over code and decisions
- **Fast iteration** without bureaucracy
- **100% equity** in the project
- **Portfolio piece** that showcases full-stack skills
- **Real business problems** to solve
- **Recurring revenue** model

### Challenges:

- **Time-consuming** - realistically 6+ months
- **Demanding** technical and business knowledge
- **Lonely** - no team to bounce ideas off
- **Every role** on one person's shoulders
- **Risk** - may not work commercially

### Recommendations:

1. **Start with the MVP** - not everything at once
2. **Validate the idea** - talk to potential customers
3. **Beta testing** - gather feedback early
4. **Automate** wherever you can
5. **Look after yourself** - avoid burnout
6. **Network** - find a mentor/community
7. **Document** - useful in the future
8. **Iterate** - improvement beats perfection

### Success Factors:

- Consistency in the work
- Focus on the user's problem
- Code quality from day one
- Quick MVP and iteration
- Marketing in parallel with development
- Don't give up!

---

**Good luck with WorkNest.**

Remember: every large system starts with the first line of code.
Stay focused, stay consistent, and keep building.
