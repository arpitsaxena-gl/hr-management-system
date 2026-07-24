---
agent: task-list-agent
cli: Cursor Agent CLI
llm: claude-4.6-sonnet-medium
run_id: 20260724T084341_a5fejp
generated_at: 2026-07-24T03:27:25.803Z
---

# Task List — HRMS Dashboard & Payroll Dashboard UI/UX Overhaul

**Repository:** `arpitsaxena-gl/hr-management-system`  
**Branch:** `feature/hrms-dashboard-payroll-overhaul`  
**Parent tracking issue:** Single Jira Story/Task covering all tasks below (all T-xx roll up to one ticket).  
**Stack:** React 18 + Vite + TypeScript + TanStack React Query + Zustand + Recharts + Tailwind CSS (frontend) / Node.js + Express.js + Mongoose + MongoDB (backend).

---

## Phase 1 — Analysis & Design Alignment

- [x] **T-01 — Confirm stack detection and map analysis gaps to tasks** (priority: high · complexity: low · depends on: —)
  - **Files:** `agent-runs/20260724T084341_a5fejp/analysis_output.json`, `agent-runs/20260724T084341_a5fejp/02-design-document.md`
  - **Description:** Verify detected stack (React 18 / Vite / Express / Mongoose) matches codebase; confirm all 3 validation gaps (`status`, `month`, `year` in `payrollController.js`), 2 performance findings (birthday scan, payroll staleTime), 1 security finding (rate limiting), 6 issues (currency, sidebar grouping, BarChart, table styling, StatCard variants, error boundaries) are each covered by at least one task. Confirm design §IX traceability links are complete.
  - **Acceptance criteria:** Every `analysis_output.json` `issues[]`, `performance_findings[]`, `security_findings[]`, and `field_validations.general[]` entry maps to a T-xx task id in this file; no orphaned findings.
  - **Traceability:** `analysis_output.json` all top-level arrays; `02-design-document.md §IX`.

- [x] **T-02 — Identify all file/module touch-points and dependency order** (priority: high · complexity: low · depends on: T-01)
  - **Files:** `client/src/lib/formatters.ts` (new), `client/src/components/ui/StatCard.tsx`, `client/src/components/layout/Sidebar.tsx`, `client/src/components/layout/Navbar.tsx`, `client/src/pages/dashboard/DashboardPage.tsx`, `client/src/pages/payroll/PayrollPage.tsx`, `backend/src/controllers/dashboardController.js`, `backend/src/routes/payroll.js`, `backend/server.js`, `client/src/App.tsx`
  - **Description:** Establish the dependency-safe build order: shared utilities and component interfaces before consumers; backend changes before frontend integration; shell (Sidebar/Navbar) before page rewrites. Confirm `express-rate-limit` npm package requirement.
  - **Acceptance criteria:** Dependency graph in this task list is acyclic; every T-xx `dependencies` array references only lower-numbered or prior-phase tasks; `express-rate-limit` is flagged for `npm install` in backend.
  - **Traceability:** `02-design-document.md §VIII` Ordered Implementation Steps.

---

## Phase 2 — Foundations & Data Layer

- [ ] **T-03 — Create `formatINR()` / `formatLakhs()` currency utility** (priority: high · complexity: low · depends on: T-02)
  - **Files:** `client/src/lib/formatters.ts` *(create new)*
  - **Description:** Create a TypeScript module exporting `formatINR(value: number): string` (renders `₹1,20,000`) and `formatLakhs(value: number): string` (renders `₹12.5L`). Replace all `Rs.` literals and bare `/ 100000` magic numbers in DashboardPage and PayrollPage. Closes `analysis_output.json.issues[0]` (currency inconsistency) and `01-code-analysis.md §9` magic-number finding.
  - **Acceptance criteria:** `formatINR(120000)` returns `'₹1,20,000'`; `formatLakhs(1250000)` returns `'₹12.5L'`; no `Rs.` string literal anywhere in `client/src/`; no bare `/ 100000` divisor in dashboard/payroll pages.
  - **Traceability:** `analysis_output.json.issues[0]`; `analysis_output.json.recommendations[6]`; design §IX row "formatINR() utility".

- [ ] **T-04 — Extend `StatCard.tsx` to support sparkline and ring variants** (priority: high · complexity: medium · depends on: T-03)
  - **Files:** `client/src/components/ui/StatCard.tsx`
  - **Description:** Extend the `StatCardProps` interface with `variant: 'default' | 'sparkline' | 'ring'`, `trend?: { value: number; label: string }`, `sparkData?: number[]`, and `ringValue?: number` (0–100). Render: inline SVG sparkline polyline for `'sparkline'` variant; SVG circle-progress ring for `'ring'` variant; gradient icon badge container (Indigo/Violet `bg-gradient-to-br`) for all variants; trend pill (`+/-` colored badge) when `trend` prop is provided. Closes `analysis_output.json.issues[4]`.
  - **Acceptance criteria:** `<StatCard variant="ring" ringValue={87} />` renders a circular SVG progress indicator at 87 %; `<StatCard variant="sparkline" sparkData={[10,14,12,18,22]} />` renders a connected polyline sparkline; `trend={{ value: 12, label: 'vs last month' }}` renders a green `+12%` pill; existing `<StatCard />` usage without new props renders unchanged (backward-compat).
  - **Traceability:** `analysis_output.json.issues[4]`; design §II Component Breakdown — `StatCard.tsx`; design §VIII Step 2.

- [ ] **T-05 — Install `express-rate-limit` and wire into `backend/server.js`** (priority: high · complexity: low · depends on: T-02)
  - **Files:** `backend/package.json`, `backend/server.js`
  - **Description:** Add `express-rate-limit` to `backend/package.json` dependencies (`npm install express-rate-limit`). In `backend/server.js`, import `rateLimit` from `express-rate-limit` and mount `rateLimit({ windowMs: 15*60*1000, max: 500, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many requests, please try again later.' } })` on `app.use('/api/', limiter)` after `helmet`/`cors` and before route mounts. Closes `analysis_output.json.security_findings[0]` (OWASP A04).
  - **Acceptance criteria:** `GET /api/dashboard/stats` returns `X-RateLimit-Limit: 500` header; rapid 501st request within 15 min window returns HTTP 429 with `{ success: false, message: 'Too many requests, please try again later.' }`; `npm start` in backend succeeds with no errors.
  - **Traceability:** `analysis_output.json.security_findings[0]`; design §VI Rate Limiting; design §VII Security.

- [ ] **T-06 — Fix birthday aggregation in `dashboardController.js` (performance)** (priority: high · complexity: low · depends on: T-02)
  - **Files:** `backend/src/controllers/dashboardController.js`
  - **Description:** Replace the current `Employee.find({ employmentStatus: 'active' })` + JavaScript `.filter(e => e.dateOfBirth.getMonth() === ...)` birthday scan with a single MongoDB aggregation: `Employee.aggregate([ { $addFields: { birthMonth: { $month: '$dateOfBirth' } } }, { $match: { employmentStatus: 'active', birthMonth: currentMonth + 1 } }, { $limit: 5 }, { $project: { firstName:1, lastName:1, dateOfBirth:1, department:1 } } ])`. Eliminates full collection scan O(n) → O(index). Closes `analysis_output.json.performance_findings[0]`.
  - **Acceptance criteria:** Dashboard stats endpoint returns correct upcoming-birthday employees for the current month without loading all employees into Node.js memory; no `Employee.find()` call remains in the birthday section of `dashboardController.js`; API response shape for birthday employees is unchanged.
  - **Traceability:** `analysis_output.json.performance_findings[0]`; design §V Business Logic §2 Birthday Query MODIFIED.

- [ ] **T-07 — Add `GET /api/dashboard/attendance-trend` endpoint** (priority: medium · complexity: medium · depends on: T-06)
  - **Files:** `backend/src/controllers/dashboardController.js`, `backend/src/routes/dashboard.js`
  - **Description:** Add a new handler `getAttendanceTrend` in `dashboardController.js` that accepts query params `month` (1–12) and `year`, validates them, then runs a MongoDB aggregation over the `attendances` collection grouping by date within the given month/year, returning `[{ date, present, absent, onLeave }]`. Register route `GET /api/dashboard/attendance-trend` in `backend/src/routes/dashboard.js` with `protect` + `authorize('admin', 'hr')` middleware.
  - **Acceptance criteria:** `GET /api/dashboard/attendance-trend?month=7&year=2026` returns HTTP 200 with `{ success: true, data: [{ date: '2026-07-01', present: N, absent: N, onLeave: N }, ...] }`; `month=13` returns HTTP 400; unauthenticated call returns HTTP 401; HR role returns 200.
  - **Traceability:** design §IV New Backend Endpoint; design §V Workflow §4 Attendance Period Toggle.

- [ ] **T-08 — Add express-validator rules to `GET /api/payroll` route** (priority: high · complexity: low · depends on: T-02)
  - **Files:** `backend/src/routes/payroll.js`
  - **Description:** Import `{ query }` from `express-validator` and the existing `validate` middleware from `backend/src/middleware/validate.js`. Add three validation rules to the `GET /` payroll route: `query('status').optional().isIn(['draft', 'processed', 'paid']).withMessage('status must be one of: draft, processed, paid')`, `query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month must be between 1 and 12')`, `query('year').optional().isInt({ min: 2000, max: new Date().getFullYear() + 1 }).withMessage('year out of valid range')`. Wire `validate` middleware after these rules and before the controller handler. Closes all three `field_validations.general` gaps.
  - **Acceptance criteria:** `GET /api/payroll?status=invalid` returns HTTP 400 with `errors[0].field === 'status'`; `GET /api/payroll?month=13` returns HTTP 400; `GET /api/payroll?year=1999` returns HTTP 400; valid params (`status=draft&month=7&year=2026`) pass through to controller unchanged.
  - **Traceability:** `analysis_output.json.field_validations.general[0-2]`; design §IV Modified Endpoint; design §V Validation Matrix.

---

## Phase 3 — Incremental Implementation

- [ ] **T-09 — Overhaul `Sidebar.tsx` with grouped collapsible navigation** (priority: high · complexity: medium · depends on: T-02)
  - **Files:** `client/src/components/layout/Sidebar.tsx`
  - **Description:** Restructure the flat `NAV_ITEMS` array into five category groups: **Core HR** (Dashboard, Employees, Attendance, Leaves), **Payroll & Finance** (Payroll, Reports), **Talent** (Recruitment, Performance, Training), **Workspace** (Holidays, Shifts, Documents, Notifications), **System Admin** (Users, Departments, Designations, Settings, Audit). Add `collapsedGroups: Record<string, boolean>` local state via `useState`. Render each group with a collapsible section toggle (Lucide `ChevronDown` / `ChevronRight`). Active nav items use `bg-gradient-to-r from-indigo-500 to-violet-500 text-white` with `rounded-xl`. Inactive items use `hover:bg-indigo-50 text-slate-600` with smooth `transition-all` micro-animations. Closes `analysis_output.json.issues[1]`.
  - **Acceptance criteria:** Sidebar renders 5 labelled collapsible groups; clicking a group header collapses/expands its items with smooth animation; active route item shows Indigo/Violet gradient; sidebar collapsed state persists across navigation; existing `SidebarProps` interface (`collapsed: boolean`, `onToggle` callback) remains unchanged.
  - **Traceability:** `analysis_output.json.issues[1]`; `analysis_output.json.recommendations[0]`; design §VIII Step 7; requirement §1 Sidebar.

- [ ] **T-10 — Overhaul `Navbar.tsx` with ⌘K command palette and modern controls** (priority: high · complexity: medium · depends on: T-04)
  - **Files:** `client/src/components/layout/Navbar.tsx`
  - **Description:** Add `cmdKOpen: boolean` local state. Render a clickable search bar button with `⌘K` badge that opens a modal command palette. The palette filters the same nav groups from T-09 by label as the user types (client-side; no API call). Add a dynamic date pill badge (`Today, Thu 24 Jul`). Add an animated notification bell with a colored dot (reads from existing notification count if available via React Query). Add a `+ Quick Action` button (primary Indigo). Modernize profile dropdown with user greeting, role badge, and sign-out option via `useAuthStore`. Handle keyboard shortcut: `keydown` event listening for `(e.metaKey || e.ctrlKey) && e.key === 'k'`. Closes recommendation from design §1 Topbar.
  - **Acceptance criteria:** Pressing `⌘K` (Mac) or `Ctrl+K` (Win/Linux) opens the command palette modal; typing filters nav items in real time; pressing `Escape` closes the modal; date pill shows current date; profile dropdown renders user name + role; all existing `NavbarProps` (`onSidebarToggle`) remain functional.
  - **Traceability:** `analysis_output.json.recommendations[1]`; design §VIII Step 8; design §IV ⌘K Command Palette; requirement §1 Topbar.

- [ ] **T-11 — Rewrite `DashboardPage.tsx` — greeting header and 8-card KPI grid** (priority: high · complexity: high · depends on: T-03, T-04, T-07)
  - **Files:** `client/src/pages/dashboard/DashboardPage.tsx`
  - **Description:** Replace the existing DashboardPage with a full production-ready implementation. **Header:** "Good morning, Super Admin 👋" dynamic greeting (morning/afternoon/evening), dynamic date pill badge, `+ Quick Action` primary button. **8 KPI cards using new StatCard variants:**
    1. Total Employees — `variant="default"` + trend badge
    2. New This Month — `variant="sparkline"`
    3. Present Today — `variant="default"` + trend badge
    4. Pending Leaves — `variant="default"` + amber accent
    5. Attendance Rate — `variant="ring"` + circular progress
    6. Monthly Payroll — `variant="sparkline"` + `formatINR()` + ₹ label
    7. Open Positions — `variant="default"` (recruitment)
    8. Upcoming Birthdays — `variant="default"` + calendar icon

    Use React Query `useQuery(['dashboard'])` targeting `GET /api/dashboard/stats`. All currency via `formatINR()`. Closes `analysis_output.json.issues[0]` (₹ currency).
  - **Acceptance criteria:** 8 KPI cards render with correct values from API; Monthly Payroll card shows `₹` symbol (no `Rs.`); Attendance Rate card shows circular ring; New This Month card shows sparkline; trend badges show `+/-` with color; page renders without errors when API data is loading (skeleton state).
  - **Traceability:** `analysis_output.json.issues[0]`; design §II DashboardPage; design §VIII Step 9; requirement §2 Header + KPI Grid.

- [ ] **T-12 — Rewrite `DashboardPage.tsx` — gradient AreaChart with period toggles** (priority: high · complexity: medium · depends on: T-11)
  - **Files:** `client/src/pages/dashboard/DashboardPage.tsx`
  - **Description:** Replace the existing BarChart attendance section with a Recharts `AreaChart` rendering three gradient-filled series: **Present** (Indigo), **Absent** (Rose), **On Leave** (Amber). Add `attendancePeriod: 'daily' | 'weekly' | 'monthly'` local state. Render three pill toggle buttons (Daily / Weekly / Monthly) above the chart. Daily mode triggers `useQuery(['attendance-trend', month, year])` to `GET /api/dashboard/attendance-trend`. Weekly and Monthly modes use data already in the dashboard stats response. Include a `<Tooltip>` with formatted day/week/month label and count per series. Closes `analysis_output.json.issues[2]`.
  - **Acceptance criteria:** Chart renders as AreaChart (not BarChart); toggling "Daily" fetches `/api/dashboard/attendance-trend`; toggling "Weekly" / "Monthly" switches to existing data without a new API call; all three series (Present / Absent / On Leave) are visible with distinct gradient fills; chart tooltip shows correct labels.
  - **Traceability:** `analysis_output.json.issues[2]`; design §V Workflow §4; design §VIII Step 9; requirement §2 Attendance Trend.

- [ ] **T-13 — Rewrite `DashboardPage.tsx` — Donut chart, Activity Feed, Quick Actions** (priority: high · complexity: medium · depends on: T-12)
  - **Files:** `client/src/pages/dashboard/DashboardPage.tsx`
  - **Description:** **Department Donut chart:** Use Recharts `PieChart` with `innerRadius` to create a donut shape. Render center text overlay showing total headcount (`11 Total`). Render a color-coded percentage legend list next to the chart (department name + color dot + percentage). **Recent Activity Feed:** Render a vertical timeline of recent events (check-ins, leave approvals, new joiners) from the dashboard API `recentActivity[]` array. Each item shows a user avatar/initial badge, event description, and relative time. **Quick Actions panel:** Render Clock In/Out, Leave Request, Upcoming Holidays, Break buttons in a 2×2 grid with Lucide icons and Indigo/Violet accent colors.
  - **Acceptance criteria:** Donut chart renders with center count label; department legend list shows name + color + percentage; Activity Feed renders at least 3 timeline items from API data; Quick Actions panel renders 4 buttons with icons; page layout is responsive and matches a modern SaaS card grid.
  - **Traceability:** design §II DashboardPage; design §VIII Step 9; requirement §2 Department Breakdown + Widgets.

- [ ] **T-14 — Rewrite `PayrollPage.tsx` — stat cards, filter controls, and floating card-table** (priority: high · complexity: high · depends on: T-03, T-04, T-08)
  - **Files:** `client/src/pages/payroll/PayrollPage.tsx`
  - **Description:** **Top 4 stat cards:** Total Payroll (`₹`), Processed, Pending, Draft — using new `StatCard` sparkline variant. **Filter controls:** Pill tab month selector (Jan–Dec) and a year dropdown. **Floating card-table rows:** Replace standard `<tr>` rows with `div`-based card rows (`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow`) for each payroll record. **Employee column:** Inline `InitialAvatar` component (colored circle with 2-letter initials + online status dot). **Sort toggle:** A-Z / Z-A toggle button on the "EMPLOYEE" column header using `sortDir: 'asc' | 'desc'` local state; sort applied client-side via `[...payrolls].sort((a,b) => ...)`. **Net Salary:** Bold typography + soft emerald `bg-emerald-50 text-emerald-700 rounded-lg px-2` badge with `₹` prefix. **Status badges:** Soft-tinted pills — Processed = `bg-green-100 text-green-700`; Draft = `bg-amber-100 text-amber-700`; Paid = `bg-blue-100 text-blue-700`. **Actions:** Replace buttons with icon tooltip group + `ActionMenu` dropdown (Approve, Mark Paid, View). Add `staleTime: 60000` to both React Query hooks. Closes `analysis_output.json.issues[3]` and `performance_findings[1]`.
  - **Acceptance criteria:** 4 stat cards render with correct ₹ totals from `GET /api/payroll/summary`; clicking month pill changes filter and re-fetches; rows render as elevated cards with hover shadow; Employee column shows initials avatar + status dot; clicking sort toggle changes sort direction and re-renders rows in A-Z or Z-A order without a new API call; Net Salary column shows emerald badge with ₹ symbol; status badges show correct tinted pills; ActionMenu dropdown opens on row action icon click; React Query `staleTime: 60000` is set on payroll queries.
  - **Traceability:** `analysis_output.json.issues[3]`; `analysis_output.json.performance_findings[1]`; design §VIII Step 10; requirement §3 all sub-requirements.

- [ ] **T-15 — Add `ErrorBoundary` wrapper in `App.tsx`** (priority: medium · complexity: low · depends on: T-02)
  - **Files:** `client/src/App.tsx`
  - **Description:** Create a class-based `ErrorBoundary` React component (or inline in `App.tsx`) that catches render errors in private route subtree and renders a fallback UI (e.g., "Something went wrong" card with a "Reload" button). Wrap `<PrivateRoute>` / `<Outlet>` in `App.tsx` with `<ErrorBoundary>`. Closes `analysis_output.json.architecture.risks[2]` and `analysis_output.json.issues[5]`.
  - **Acceptance criteria:** A deliberate throw inside a page component is caught by the boundary (displays fallback, does not crash the whole SPA); pages outside the boundary (e.g., LoginPage) are unaffected; existing routing and auth behavior is unchanged.
  - **Traceability:** `analysis_output.json.architecture.risks[2]`; `analysis_output.json.issues[5]`; design §II Cross-Cutting Concerns — Error handling; design §VIII Step 11.

---

## Phase 4 — Testing & Quality Control

- [ ] **T-16 — API validation tests — payroll filter params** (priority: high · complexity: low · depends on: T-08)
  - **Files:** `backend/src/routes/payroll.js`, `backend/src/middleware/validate.js`
  - **Description:** Manually (or via HTTP client / curl / Postman) verify all three new express-validator rules on `GET /api/payroll`. Test matrix: invalid `status` → 400; `month=0` → 400; `month=13` → 400; `month=1` → passes; `year=1999` → 400; `year=2099` → 400; valid `year=2026` → passes; all three valid → 200 with paginated data. Regression: existing payroll list with no params still returns 200.
  - **Acceptance criteria:** All 8 test cases produce expected HTTP status; error body matches `{ success: false, errors: [{ field, message }] }` shape; zero regression on existing payroll read paths.
  - **Traceability:** `analysis_output.json.field_validations.general[0-2]`; design §V Validation Matrix.

- [ ] **T-17 — Unit-test `formatINR()` utility** (priority: medium · complexity: low · depends on: T-03)
  - **Files:** `client/src/lib/formatters.ts`
  - **Description:** Add inline test cases (or a `formatters.test.ts` if a test runner is configured) covering: `formatINR(0)` = `'₹0'`; `formatINR(1000)` = `'₹1,000'`; `formatINR(120000)` = `'₹1,20,000'`; `formatINR(1250000)` produces correct lakh formatting; negative values handled gracefully.
  - **Acceptance criteria:** All 5 cases pass; no `Rs.` string returned; `formatINR` is a pure function with no side effects.
  - **Traceability:** `analysis_output.json.issues[0]`; `analysis_output.json.recommendations[6]`.

- [ ] **T-18 — StatCard variant rendering verification** (priority: medium · complexity: low · depends on: T-04)
  - **Files:** `client/src/components/ui/StatCard.tsx`
  - **Description:** Visually verify (or write component snapshot test if Vitest/Testing Library is configured) all three StatCard variants: `default` (no extras), `sparkline` (SVG polyline renders, no layout shift), `ring` (SVG circle renders at correct stroke-dashoffset for 0%, 50%, 100% values). Verify backward compatibility: existing `<StatCard>` usage in DashboardPage pre-overhaul does not break.
  - **Acceptance criteria:** All three variants render without TypeScript type errors; `ringValue=0` shows empty ring; `ringValue=100` shows full ring; `sparkData=[]` shows flat sparkline without crash; existing callers unaffected.
  - **Traceability:** `analysis_output.json.issues[4]`; design §II StatCard.tsx.

- [ ] **T-19 — Dashboard AreaChart + period toggle verification** (priority: medium · complexity: low · depends on: T-12)
  - **Files:** `client/src/pages/dashboard/DashboardPage.tsx`
  - **Description:** Visually verify the attendance AreaChart: (1) defaults to Monthly view on page load; (2) clicking Daily fires `useQuery(['attendance-trend', ...])` and renders new data; (3) all three gradient series (Present/Absent/On Leave) are visible and distinct; (4) tooltips show correct formatted labels; (5) chart is responsive on mobile viewport.
  - **Acceptance criteria:** No BarChart import remains in DashboardPage; AreaChart renders three named series; period toggle state change produces correct chart data swap; no console errors during toggle; responsive at 375px width.
  - **Traceability:** `analysis_output.json.issues[2]`; design §V Workflow §4.

- [ ] **T-20 — Payroll sort toggle and card-row verification** (priority: medium · complexity: low · depends on: T-14)
  - **Files:** `client/src/pages/payroll/PayrollPage.tsx`
  - **Description:** Verify payroll page: (1) clicking A-Z sort toggle sorts current page rows alphabetically ascending by `employee.firstName`; (2) clicking again sorts descending (Z-A); (3) floating card rows show correct `box-shadow` on hover; (4) `InitialAvatar` renders 2-letter initials with correct background color; (5) status badges show correct tinted pill colors per status value; (6) ActionMenu dropdown opens and lists correct actions (Approve / Mark Paid / View).
  - **Acceptance criteria:** Sort changes order without API call (network tab shows no new request); hover shadow is visually distinct; avatars always show 2 letters; no status badge renders plain text without pill styling; ActionMenu closes on Escape or outside click.
  - **Traceability:** `analysis_output.json.issues[3]`; design §V Workflow §3; requirement §3.

- [ ] **T-21 — Rate limit smoke test and build verification** (priority: high · complexity: low · depends on: T-05)
  - **Files:** `backend/server.js`, `backend/package.json`
  - **Description:** Verify `express-rate-limit` is installed and active: (1) `npm start` in backend starts without errors; (2) `GET /api/dashboard/stats` returns `X-RateLimit-Limit: 500` response header; (3) TypeScript/ESLint build for frontend (`npm run build` in client) passes with zero errors; (4) no `Rs.` or bare `/ 100000` magic number survives linting.
  - **Acceptance criteria:** Backend `npm start` exits 0 (or stays running); response includes rate-limit headers; frontend `npm run build` completes with 0 TypeScript errors; ESLint passes.
  - **Traceability:** `analysis_output.json.security_findings[0]`; design §VI Rate Limiting.

- [ ] **T-22 — Regression check on unchanged routes and components** (priority: medium · complexity: low · depends on: T-09, T-10, T-11, T-13, T-14, T-15)
  - **Files:** `client/src/App.tsx`, `client/src/components/layout/Layout.tsx`, all non-dashboard/payroll page files
  - **Description:** Verify that overhauling Sidebar, Navbar, StatCard, DashboardPage, PayrollPage, and App.tsx does not break: (1) LoginPage still renders and auth flow works; (2) EmployeesPage, LeavesPage, AttendancePage, ReportsPage etc. render without errors; (3) Sidebar collapse prop still works from Layout.tsx; (4) Navbar `onSidebarToggle` prop still connects correctly from Layout.tsx; (5) ErrorBoundary does not swallow successful renders.
  - **Acceptance criteria:** All 10+ non-modified page routes render without white-screen errors; Sidebar toggle works from Layout; JWT expiry still redirects to login; no TypeScript import errors introduced.
  - **Traceability:** Design §VIII Impact Analysis — Blast Radius column; design §II Cross-Cutting Concerns.

---

## Phase 5 — Handoff Summary

- [ ] **T-23 — Compatibility, migration, and rollback notes** (priority: high · complexity: low · depends on: all prior tasks)
  - **Files:** `agent-runs/20260724T084341_a5fejp/03-task-list.md` (this document — notes below)
  - **Description:** Document release compatibility and rollback steps.

  **Compatibility notes:**
  - No MongoDB schema migrations required — all collections are read-only in this change (no new fields added to any Mongoose model).
  - `express-rate-limit` is a new npm dependency — `npm install` must run in `backend/` before deployment. If using a CI/CD pipeline, ensure the install step is present.
  - New validation rules on `GET /api/payroll` are a **breaking change for previously-tolerated invalid inputs**: callers sending `status=invalid` or `month=13` will now receive HTTP 400 instead of empty result sets. Any automation or script using the payroll API with unchecked params should be audited.
  - New `GET /api/dashboard/attendance-trend` endpoint is **additive** — no change required on existing callers.
  - `formatINR()` utility lives in `client/src/lib/formatters.ts`. If any other page currently imports a different currency helper, update imports.

  **Rollback plan:**
  - All changes are on branch `feature/hrms-dashboard-payroll-overhaul`. Rolling back = reverting the PR merge or deleting the branch. No DB migration rollback needed.
  - To revert `express-rate-limit` only: remove `app.use('/api/', limiter)` from `server.js` and remove the package from `backend/package.json`.
  - To revert payroll validation only: remove the three `query(...)` rules and `validate` middleware call from `backend/src/routes/payroll.js`.

  - **Acceptance criteria:** Rollback procedure documented and executable in < 5 min by any backend developer; no data loss on rollback.
  - **Traceability:** Design §VI; design §VIII Impact Analysis.

- [ ] **T-24 — Manual-review flags for high-risk changes** (priority: high · complexity: low · depends on: T-05, T-06, T-07, T-08)
  - **Files:** `backend/src/controllers/dashboardController.js`, `backend/src/routes/payroll.js`, `backend/server.js`
  - **Description:** The following items require a senior backend developer's manual review before merging:
    1. **Birthday aggregation (`dashboardController.js`):** Verify the `$month` operator returns 1-indexed values matching `new Date().getMonth() + 1`. If the current month is December (12), confirm no off-by-one bug in the `birthMonth` match.
    2. **Rate limit config (`server.js`):** Confirm `max: 500` per 15 min is appropriate for peak concurrent admin usage. Check whether `express-rate-limit` `skip` option is needed for internal health-check routes.
    3. **Payroll validation (`payroll.js`):** Confirm the `year` upper bound (`currentYear + 1`) is correct for advance payroll processing use cases. Confirm whether `employeeId` ObjectId validation should also be added (currently out of scope).
    4. **Attendance trend aggregation (`dashboardController.js`):** Review MongoDB aggregation pipeline for index utilization; confirm `attendances.date` has an index.
  - **Acceptance criteria:** Each flagged item reviewed and sign-off recorded in PR comments; no merge without sign-off on items 1 and 3 (highest risk).
  - **Traceability:** Design §X Open Questions #1, #3, #4; `analysis_output.json.performance_findings[0]`.

- [ ] **T-25 — Traceability sign-off and parent ticket closure** (priority: medium · complexity: low · depends on: T-23, T-24)
  - **Files:** `agent-runs/20260724T084341_a5fejp/03-task-list.md`, `agent-runs/20260724T084341_a5fejp/tasks.json`
  - **Description:** Confirm full traceability from requirements → design → tasks → implementation:
    - Every `analysis_output.json.issues[]` (6 items) → covered: T-03 (currency), T-09 (sidebar), T-12 (AreaChart), T-14 (table rows+sort), T-04 (StatCard), T-15 (ErrorBoundary).
    - Every `performance_findings[]` (3 items) → covered: T-06 (birthday), T-14 (staleTime), T-07+T-21 (monitored, acceptable).
    - Every `security_findings[]` (2 items) → covered: T-05 (rate limit), T-08 (input sanitization).
    - Every `field_validations.general[]` (3 items) → covered: T-08.
    - All user requirements §1–§3 → covered: T-09 (Sidebar), T-10 (Navbar), T-11–T-13 (Dashboard), T-14 (Payroll).
    - All design §VIII 12 implementation steps → covered by T-03 through T-15 in order.
    - All tasks roll up to **one parent Jira Story** (single-cycle deliverable as required).
  - **Acceptance criteria:** Sign-off table is complete with no uncovered finding; all T-xx tasks are in `tasks.json`; parent Jira Story/Task is updated to link all subtasks; PR Agent (`pr-creator-agent`) is notified to open the pull request for branch `feature/hrms-dashboard-payroll-overhaul`.
  - **Traceability:** `02-design-document.md §IX` full traceability table; requirement "single Jira task" deliverable constraint.

---

## Dependency Graph Summary

```
T-01 → T-02
T-02 → T-03, T-04, T-05, T-06, T-08, T-09, T-15
T-03 → T-11, T-14, T-17
T-04 → T-10, T-11, T-14, T-18
T-05 → T-21
T-06 → T-07
T-07 → T-12
T-08 → T-16
T-11 → T-12
T-12 → T-13, T-19
T-13 → T-22
T-14 → T-20, T-22
T-15 → T-22
T-09 → T-22
T-10 → T-22
T-16, T-17, T-18, T-19, T-20, T-21, T-22 → T-23
T-23 → T-24 → T-25
```

*Graph is acyclic. All dependency ids exist within this document.*

---

*Task list version: 1.0 — Generated by task-list-agent for run `20260724T084341_a5fejp`.*
