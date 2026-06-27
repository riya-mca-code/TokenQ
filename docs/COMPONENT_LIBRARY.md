# TokenQ Component Library

## Rules

Build reusable components.

Never duplicate UI.

Reuse existing components before creating new ones.

Use TypeScript.

Use Tailwind CSS.

Use shadcn/ui where applicable.

---

# Layout

AppLayout

Sidebar

Topbar

PageHeader

Section

Container

Footer

---

# Navigation

Navbar

Sidebar

MobileDrawer

Breadcrumb

Tabs

Pagination

SearchBar

---

# Buttons

PrimaryButton

SecondaryButton

OutlineButton

GhostButton

DangerButton

IconButton

LoadingButton

Rules

* Same height
* Same radius
* Same spacing
* Loading state
* Disabled state

---

# Cards

Card

StatCard

AnalyticsCard

CustomerCard

CounterCard

QueueCard

FeatureCard

EmptyCard

Rules

* Radius 12px
* Soft shadow
* White background

---

# Forms

TextInput

EmailInput

PhoneInput

PasswordInput

Textarea

Select

MultiSelect

Checkbox

Radio

Switch

DatePicker

TimePicker

FormSection

Rules

* Label
* Placeholder
* Validation
* Error
* Helper Text

---

# Queue Components

TokenCard

QueueTable

QueueRow

QueueStatusBadge

CounterCard

CurrentServingCard

WaitingCard

CustomerInfoCard

QueueFilters

QueueSearch

QueueActions

---

# Dashboard Components

DashboardHeader

KPIGrid

StatCard

ChartCard

ActivityFeed

QuickActions

RecentCustomers

CounterOverview

---

# Analytics

BarChart

LineChart

PieChart

AreaChart

Heatmap

TrendCard

MetricCard

ExportActions

---

# Tables

DataTable

TableToolbar

ColumnFilter

TablePagination

EmptyTable

MobileTableCard

Rules

Desktop

Table

Mobile

Cards

---

# Status

StatusBadge

PriorityBadge

RoleBadge

OnlineBadge

OfflineBadge

---

# Feedback

Alert

Toast

SuccessToast

ErrorToast

WarningToast

ConfirmationDialog

DeleteDialog

LoadingOverlay

Skeleton

Spinner

---

# Customer

GenerateTokenForm

CustomerProfile

TokenDetails

QueueTracker

QRCard

EstimatedWaitCard

PeopleAheadCard

---

# Admin

StaffTable

CounterTable

OrganizationTable

AuditTable

SettingsForm

ReportCard

---

# Super Admin

OrganizationCard

OrganizationTable

PlatformStats

SubscriptionCard

AuditLogs

---

# Modals

CreateOrganization

CreateStaff

CreateCounter

EditProfile

ResetQueue

DeleteConfirmation

---

# Settings

ProfileForm

OrganizationForm

BusinessHours

BrandSettings

NotificationSettings

SecuritySettings

---

# Empty States

NoQueue

NoCustomers

NoReports

NoCounters

NoOrganizations

NoSearchResults

---

# Loading

SkeletonCard

SkeletonTable

SkeletonChart

ButtonLoading

PageLoading

---

# Icons

Lucide React only.

Never mix icon libraries.

---

# Component Rules

* One responsibility.
* Reusable.
* Accessible.
* Responsive.
* Typed.
* Stateless when possible.
* Business logic outside UI.
* No duplicate components.
* Keep props minimal.
* Reuse before creating new.
