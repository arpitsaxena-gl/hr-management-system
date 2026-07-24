---
agent: jira-spec-drafter-agent
cli: Cursor Agent CLI
llm: claude-4.6-sonnet-medium
run_id: 20260724T084341_a5fejp
generated_at: 2026-07-24T03:35:01.828Z
---

# Jira Spec — HRMS & Payroll Dashboard UI/UX and Backend Overhaul

## Description

Deliver a complete, production-ready modernization of the HRMS Main Dashboard and Payroll Dashboard in a single iteration — covering visual redesign, interaction improvements, and backend fixes. The overhaul replaces a flat, visually dated interface with a modern SaaS experience featuring a grouped collapsible sidebar, a command-palette top bar, an 8-card KPI grid, enriched attendance and department charts, a floating card-based payroll table with interactive sorting, and corrected Indian Rupee (₹) currency formatting throughout. Backend changes close three validation gaps, eliminate a database performance issue, add a new attendance trend endpoint, and introduce API rate limiting.

## User Story

As an HR Manager, Payroll Officer, or Super Admin, I want a modern, information-rich dashboard experience with consistent currency formatting, fast page loads, and intuitive navigation, so that I can monitor workforce and payroll health at a glance without navigating between multiple pages or encountering inconsistent data presentation.

## Background / Context

The HRMS application currently has a functional but visually dated interface that presents several usability and reliability gaps:

- The sidebar navigation is a flat, ungrouped list, making it difficult for users to locate features quickly as the product grows.
- The main dashboard provides only 4 KPI cards with a basic bar chart, giving HR Managers an incomplete view of workforce health and making payroll monitoring harder than necessary.
- The payroll table uses plain rows with no visual hierarchy, bulk-style action buttons, and inconsistent currency symbols (`Rs.` in some places, bare numbers in others), reducing confidence in the data.
- A full-collection database scan runs on every dashboard load to find employee birthdays, creating unnecessary server load that will worsen as headcount grows.
- The payroll API accepts any value for filter parameters (status, month, year) without validation, silently returning empty result sets for invalid inputs instead of clear error messages.
- No rate limiting exists on the API layer, leaving the application open to abuse.

These issues were identified through codebase analysis and are tracked in the pipeline analysis artifacts for run `20260724T084341_a5fejp`. All changes are confined to eight existing files plus two new utilities — no database schema changes are required.

## Scope

**In Scope**

- Sidebar navigation restructured into five collapsible category groups (Core HR, Payroll & Finance, Talent, Workspace, System Admin) with Indigo/Violet gradient active state and smooth micro-animations
- Top navigation bar modernized with a ⌘K / Ctrl+K command palette search modal, dynamic date pill badge, animated notification indicator, and polished profile dropdown
- HRMS Main Dashboard rewritten with a personalized greeting header, 8 KPI cards (gradient icon badges, sparkline charts, circular ring progress for Attendance Rate, ₹ currency formatting for Monthly Payroll), gradient multi-series Area Chart for attendance trends with Daily/Weekly/Monthly period toggles, Department Donut Chart with center headcount summary and color-coded legend, Recent Activity Feed timeline, and Quick Actions panel
- Payroll Dashboard rewritten with 4 summary stat cards (sparklines, ₹ formatting), pill-tab month selector, floating card-style table rows with hover elevation, employee column with initial-avatar badges and online status dots, interactive A-Z/Z-A sort toggle on the Employee column (client-side, current page), Net Salary highlighted with a bold emerald badge, soft-tinted status pills (Processed = green, Draft = amber, Paid = blue), and icon-based action dropdown menus (Approve, Mark Paid, View)
- New `formatINR()` currency utility replacing all `Rs.` literals and bare division magic numbers
- New backend endpoint `GET /api/dashboard/attendance-trend` returning per-day attendance counts for the Daily chart toggle
- Birthday query in the dashboard controller replaced with a MongoDB aggregation pipeline (eliminates full collection scan)
- Express-validator rules added to `GET /api/payroll` for `status`, `month`, and `year` parameters
- `express-rate-limit` middleware added to the backend API layer (500 requests per 15 minutes per IP)
- React Query `staleTime` configuration added to payroll data hooks
- Error boundary added to the frontend application shell

**Out of Scope**

- Other page modules (Employees, Leaves, Attendance detail pages, Reports, Recruitment, etc.)
- Authentication flows, password reset, or session management
- Email service or Socket.IO real-time infrastructure
- Database schema migrations or new Mongoose model fields
- Mobile app or PWA
- Server-side sort for payroll (A-Z/Z-A applies to the current fetched page only; server-side sort is a follow-up)
- Unit/integration test files (noted as technical debt; recommended for a follow-up ticket)
- CI/CD pipeline changes beyond the `npm install` step for the new rate-limit package

## Acceptance Criteria

**1. Sidebar Navigation**
- Given a logged-in user views the sidebar, when the page loads, then navigation items are organized into five labeled collapsible groups: Core HR, Payroll & Finance, Talent, Workspace, and System Admin.
- Given a user clicks a group header, when toggled, then the group's items expand or collapse with a smooth animation and the toggle icon changes to reflect the state.
- Given a user navigates to any page, when viewing the sidebar, then the active route item is highlighted with an Indigo-to-Violet gradient background.

**2. Top Bar — ⌘K Command Palette**
- Given a user is on any authenticated page, when they press ⌘K (macOS) or Ctrl+K (Windows/Linux), then a command palette modal opens.
- Given the command palette is open, when the user types a term, then navigation items matching the term are filtered in real time without an API call.
- Given the command palette is open, when the user presses Escape, then the modal closes.
- Given the top bar renders, then a dynamic date pill badge (e.g., "Thu 24 Jul") and a Quick Action button are visible alongside the notification bell and profile menu.

**3. HRMS Main Dashboard — Header and KPI Grid**
- Given the dashboard loads, then a personalized greeting ("Good morning / Good afternoon / Good evening, [User Name]") and a dynamic date badge are displayed in the header.
- Given the dashboard API returns data, then exactly 8 KPI cards are rendered: Total Employees, New This Month, Present Today, Pending Leaves, Attendance Rate, Monthly Payroll, Open Positions, and Upcoming Birthdays.
- Given the Monthly Payroll KPI card renders, then the value displays with the ₹ symbol (not "Rs." or a bare number).
- Given the Attendance Rate KPI card renders, then a circular ring progress indicator reflects the current attendance percentage.
- Given the New This Month KPI card renders, then a sparkline trend chart is visible within the card.
- Given any KPI card has a trend value, then a trend badge (e.g., "+12% vs last month") is displayed in a color-coded pill (green for positive, red for negative).
- Given the dashboard API is loading, then skeleton placeholder states render without layout shift.

**4. HRMS Main Dashboard — Attendance Area Chart**
- Given the dashboard loads, then the attendance trend is rendered as a gradient multi-series Area Chart (not a bar chart), showing Present, Absent, and On Leave as distinct series.
- Given the user clicks the "Daily" period toggle, then the chart fetches and renders per-day attendance data from the new `/api/dashboard/attendance-trend` endpoint.
- Given the user clicks "Weekly" or "Monthly", then the chart switches to the corresponding data already in the dashboard stats response without an additional API call.
- Given the user hovers over a chart point, then a formatted tooltip shows the date label and counts for each series.

**5. HRMS Main Dashboard — Department Chart and Widgets**
- Given the dashboard loads, then a Donut Chart shows department headcount breakdown with a center label displaying the total headcount (e.g., "11 Total").
- Given the Donut Chart renders, then a color-coded legend list beside the chart shows each department's name, color swatch, and percentage.
- Given the Recent Activity Feed renders, then at least three timeline items appear (check-ins, leave approvals, or new joiners) each with an avatar/initial badge, description, and relative time.
- Given the Quick Actions panel renders, then four action buttons (Clock In/Out, Leave Request, Upcoming Holidays, Break) display with Lucide icons and Indigo/Violet accents.

**6. Payroll Dashboard — Stat Cards and Filters**
- Given the payroll page loads, then four summary stat cards render at the top: Total Payroll (₹), Processed, Pending, and Draft — each with a sparkline chart and trend badge.
- Given the user selects a month from the pill-tab selector, then the payroll table and summary cards re-fetch data for the selected month.

**7. Payroll Dashboard — Floating Card Table**
- Given payroll data loads, then each payroll record renders as a floating card row with a visible `box-shadow` that elevates on hover.
- Given any payroll row renders, then the Employee column shows a colored initial-avatar badge (two-letter initials) with an online status dot indicator.
- Given the user clicks the "EMPLOYEE" column sort toggle, then the rows re-sort A-Z or Z-A by employee first name on the current page without triggering a new API call.
- Given the Net Salary column renders, then values display with bold typography inside a soft emerald badge with the ₹ symbol.
- Given a payroll record has status "Processed", then its status badge renders as a soft green pill; "Draft" renders as amber; "Paid" renders as blue.
- Given the user clicks the action icon on any row, then a dropdown menu appears with options: Approve, Mark Paid, and View.

**8. Backend — API Validation**
- Given a caller sends `GET /api/payroll?status=invalid`, then the API returns HTTP 400 with an error body identifying the `status` field.
- Given a caller sends `GET /api/payroll?month=13`, then the API returns HTTP 400.
- Given a caller sends `GET /api/payroll?year=1999`, then the API returns HTTP 400.
- Given valid parameters are sent, then the payroll list endpoint returns HTTP 200 with paginated results unchanged.

**9. Backend — Performance and Security**
- Given the dashboard stats endpoint is called, then the birthday employee query uses a MongoDB aggregation pipeline (no full employee collection scan in application memory).
- Given any API request is made, then the response includes the `X-RateLimit-Limit` header.
- Given a single IP sends more than 500 requests within 15 minutes to `/api/`, then subsequent requests return HTTP 429 with `{ "success": false, "message": "Too many requests, please try again later." }`.

**10. Regression and Stability**
- Given all changes are deployed, then all existing non-dashboard/payroll page routes (Employees, Leaves, Attendance, Reports, etc.) render without white-screen errors.
- Given a render error occurs in a private route, then the Error Boundary displays a fallback UI instead of crashing the entire application.
- Given no authentication token is present, then the application redirects to the login page as before.

## Technical Notes

- **Stack:** React 18 + Vite + TypeScript (frontend) / Node.js + Express.js + Mongoose + MongoDB (backend). UI uses Tailwind CSS utility classes, Recharts for charts, and Lucide React for icons. State management via TanStack React Query (server state) and Zustand (auth store).
- **Files modified (frontend):** `client/src/components/layout/Sidebar.tsx`, `client/src/components/layout/Navbar.tsx`, `client/src/components/ui/StatCard.tsx`, `client/src/pages/dashboard/DashboardPage.tsx`, `client/src/pages/payroll/PayrollPage.tsx`, `client/src/App.tsx`
- **Files created (frontend):** `client/src/lib/formatters.ts` — exports `formatINR(value: number): string` and `formatLakhs(value: number): string`
- **Files modified (backend):** `backend/src/controllers/dashboardController.js` (birthday aggregation fix + new attendance-trend handler), `backend/src/routes/dashboard.js` (new route registration), `backend/src/routes/payroll.js` (express-validator rules), `backend/server.js` (rate-limit middleware)
- **New npm dependency:** `express-rate-limit` in `backend/package.json` — `npm install express-rate-limit` required before deployment
- **Birthday aggregation fix:** Replaces `Employee.find({ employmentStatus: 'active' })` + JS `.filter()` with `Employee.aggregate([ { $addFields: { birthMonth: { $month: '$dateOfBirth' } } }, { $match: { employmentStatus: 'active', birthMonth: <currentMonth+1> } }, { $limit: 5 } ])`. Note: `$month` operator returns 1-indexed values; verify off-by-one is not present for December (month 12).
- **Payroll sort:** Client-side sort on the current fetched page via `[...payrolls].sort((a, b) => a.employee.firstName.localeCompare(b.employee.firstName))`. Server-side sort is explicitly out of scope for this iteration.
- **Rate limit config:** `windowMs: 15 * 60 * 1000`, `max: 500`, mounted on `app.use('/api/', limiter)`. Confirm whether health-check routes need to be excluded via the `skip` option.
- **Payroll validation — breaking change:** Callers currently sending `status=invalid`, `month=13`, or `year=1999` receive HTTP 200 with empty results. After this change they will receive HTTP 400. Any automation scripts using the payroll API must be audited before deployment.
- **`staleTime`:** Set `staleTime: 60000` on both TanStack React Query hooks in `PayrollPage.tsx`.
- **Error Boundary:** Class-based React component wrapping `<PrivateRoute>` / `<Outlet>` in `App.tsx`; renders a "Something went wrong" fallback card with a Reload button.

## Dependencies

- Existing `express-validator` package already in use in backend routes — no new dependency required for validation middleware.
- New npm package `express-rate-limit` must be installed in `backend/` before the backend server starts.
- The new `GET /api/dashboard/attendance-trend` endpoint must be deployed before the frontend Daily period toggle is enabled.
- `formatINR()` utility must be created before `DashboardPage.tsx` and `PayrollPage.tsx` are rewritten.
- Extended `StatCard.tsx` interface must be complete before page-level consumers use the new variants.
- No upstream team or external system dependencies — all changes are self-contained within the monorepo.
- No database schema migrations or data backfills required.

## Open Questions

1. **A-Z/Z-A sort scope:** The sort toggle applies to the current fetched page only. Should sort be performed server-side across all records? Product Owner to confirm whether this is acceptable for the current iteration.
2. **Rate limit threshold:** Is 500 requests per 15 minutes per IP appropriate given expected concurrent admin and batch payroll processing usage? DevOps / Team Lead to confirm before production deployment.
3. **Activity Feed event types:** The Recent Activity Feed assumes events are available from the existing `/api/dashboard/stats` `recentActivity[]` array. If additional event types are required, a new `/api/dashboard/activity` endpoint will be needed — Product Owner to confirm.
4. **`express-rate-limit` already installed?** Developer to verify `backend/package.json` does not already include this package before running `npm install`.
5. **Attendance index:** Confirm that the `attendances` collection has an index on the `date` field to support the new `/api/dashboard/attendance-trend` aggregation efficiently.
