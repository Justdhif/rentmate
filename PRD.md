# RENTMATE

## Smart Kost Management Platform

**Product Requirements Document (PRD)**
**Version:** 1.0
**Status:** Draft / Development Ready
**Product Type:** Web Dashboard + Mobile Application
**Target:** Bootcamp Project / Portfolio Project

---

# 1. Product Overview

## 1.1 Product Name

**RentMate**

## 1.2 Tagline

> **One platform to manage your kost, from rent to maintenance.**

## 1.3 Product Description

RentMate adalah platform manajemen kost yang menghubungkan **pemilik/pengelola kost, penghuni, dan teknisi** dalam satu sistem.

RentMate membantu pemilik kost mengelola:

* Properti
* Kamar
* Penghuni
* Pembayaran
* Maintenance
* Notifikasi
* Analytics

Sementara penghuni dapat menggunakan RentMate untuk:

* Melihat informasi kamar
* Melihat tagihan
* Membayar sewa
* Melaporkan kerusakan
* Melihat status maintenance
* Menerima notifikasi

RentMate memiliki fitur **AI Smart Assistant** yang menganalisis laporan maintenance dan data properti untuk memberikan insight kepada pemilik kost.

---

# 2. Problem Statement

Pengelolaan kost secara konvensional sering dilakukan menggunakan:

* WhatsApp
* Spreadsheet
* Catatan manual
* Transfer bank manual
* Chat pribadi

Hal tersebut menyebabkan beberapa masalah:

### Bagi Owner

1. Sulit mengetahui status semua kamar.
2. Sulit melacak pembayaran yang terlambat.
3. Laporan kerusakan tercampur dengan chat biasa.
4. Tidak ada histori maintenance yang terstruktur.
5. Sulit mengetahui kamar atau fasilitas yang sering bermasalah.
6. Tidak memiliki analytics properti secara real-time.

### Bagi Tenant

1. Tidak selalu mengetahui kapan pembayaran jatuh tempo.
2. Sulit mengetahui status laporan kerusakan.
3. Harus menghubungi owner secara manual.
4. Tidak memiliki riwayat pembayaran yang terorganisir.
5. Informasi kost tersebar di berbagai chat.

---

# 3. Product Vision

Membangun platform digital yang membuat pengelolaan kost menjadi:

> **lebih sederhana, transparan, terorganisir, dan data-driven.**

RentMate tidak hanya menjadi tempat mencatat data kost, tetapi menjadi **operating system untuk pengelolaan kost.**

---

# 4. Product Goals

## Primary Goals

1. Memusatkan seluruh data properti dalam satu platform.
2. Mempermudah pengelolaan kamar dan penghuni.
3. Mengotomatisasi proses pembayaran.
4. Membuat sistem maintenance yang terstruktur.
5. Memberikan insight berbasis data kepada owner.
6. Menggunakan AI untuk membantu klasifikasi dan analisis maintenance.
7. Mengurangi ketergantungan terhadap WhatsApp untuk operasional kost.

## Secondary Goals

1. Meningkatkan transparansi antara owner dan tenant.
2. Mengurangi human error.
3. Membuat histori transaksi dan maintenance yang mudah dilacak.
4. Membuat pengalaman pengelolaan kost lebih modern.

---

# 5. Target Users

RentMate memiliki empat role utama.

## 5.1 Owner

Pemilik properti kost.

### Needs

* Mengelola properti.
* Mengelola kamar.
* Mengelola tenant.
* Melihat pemasukan.
* Melacak pembayaran.
* Mengelola maintenance.
* Melihat analytics.

---

## 5.2 Tenant

Penghuni kost.

### Needs

* Mengetahui informasi kamar.
* Mengetahui tagihan.
* Membayar sewa.
* Melaporkan masalah.
* Melihat status maintenance.
* Mendapatkan reminder.

---

## 5.3 Technician

Teknisi yang menangani maintenance.

### Needs

* Melihat pekerjaan yang ditugaskan.
* Melihat detail masalah.
* Mengubah status pekerjaan.
* Mengupload bukti penyelesaian.

---

## 5.4 Admin

Administrator platform RentMate.

### Needs

* Mengelola user.
* Mengelola laporan.
* Monitoring sistem.
* Menangani abuse/report.
* Melihat platform statistics.

---

# 6. User Roles & Permissions

| Feature         | Admin | Owner |   Tenant | Technician |
| --------------- | ----: | ----: | -------: | ---------: |
| Manage Users    |     ✓ |     - |        - |          - |
| Manage Property |     - |     ✓ |        - |          - |
| Manage Rooms    |     - |     ✓ |     View |          - |
| Manage Tenant   |     - |     ✓ |        - |          - |
| View Rent       |     ✓ |     ✓ |        ✓ |          - |
| Make Payment    |     - |     - |        ✓ |          - |
| Maintenance     |     ✓ |     ✓ |   Create |   Assigned |
| Analytics       |     ✓ |     ✓ | Personal |          - |
| AI Insight      |     ✓ |     ✓ |  Limited |          - |
| Notifications   |     ✓ |     ✓ |        ✓ |          ✓ |
| Profile         |     ✓ |     ✓ |        ✓ |          ✓ |

---

# 7. Core Features

RentMate dibagi menjadi beberapa domain.

```text
Authentication
     │
     ├── User Management
     │
     ├── Property Management
     │
     ├── Room Management
     │
     ├── Tenant Management
     │
     ├── Payment Management
     │
     ├── Maintenance Management
     │
     ├── Notification
     │
     ├── Analytics
     │
     └── AI Smart Assistant
```

---

# 8. Authentication

## Features

* Register
* Login
* Logout
* Forgot password
* Reset password
* Email verification
* JWT authentication
* Refresh token
* Role-based authorization

## Registration

User memilih:

```text
I am a...

○ Property Owner
○ Tenant
○ Technician
```

Kemudian:

```text
Full Name
Email
Password
Confirm Password
```

---

# 9. Owner Features

# 9.1 Owner Dashboard

Dashboard harus memberikan overview kondisi properti.

### KPI Cards

```text
Total Rooms
42

Occupied
38

Available
4

Maintenance
2
```

### Financial Overview

```text
Monthly Revenue

Rp57.000.000

+12.4%
vs last month
```

### Payment Overview

```text
Paid       34
Pending     3
Overdue     1
```

### Maintenance Overview

```text
Open
4

In Progress
2

Resolved
18
```

---

# 9.2 Property Management

Owner dapat:

* Membuat properti.
* Mengedit properti.
* Menghapus properti.
* Melihat detail properti.
* Menambahkan fasilitas.
* Menambahkan aturan kost.
* Mengupload foto properti.

### Property Data

```text
Property Name
Address
Description
Property Photos
Facilities
Rules
Contact Information
```

---

# 9.3 Room Management

Owner dapat membuat dan mengelola kamar.

### Room Data

```text
Room Number
Floor
Price
Room Type
Facilities
Status
Description
Photos
```

### Room Status

```text
AVAILABLE
OCCUPIED
MAINTENANCE
```

### Room Detail

```text
Room A-12

Status
Occupied

Monthly Rent
Rp1.500.000

Tenant
John Doe

Next Payment
12 September 2026

Maintenance
2 active requests
```

---

# 9.4 Tenant Management

Owner dapat:

* Menambahkan tenant.
* Mengundang tenant.
* Melihat tenant.
* Assign tenant ke kamar.
* Mengakhiri kontrak.
* Melihat histori pembayaran.

### Tenant Profile

```text
Name
Email
Phone
Room
Move-in Date
Move-out Date
Payment Status
```

---

# 10. Tenant Features

# 10.1 Tenant Dashboard

Dashboard dibuat lebih sederhana daripada owner dashboard.

```text
Good evening 👋

Room A-12

Rp1.500.000
Monthly Rent

Due in 12 days

[ Pay Rent ]

------------------

Maintenance

AC Issue
In Progress

------------------

Upcoming

Rent Payment
12 Sep 2026
```

---

# 10.2 Room Information

Tenant dapat melihat:

* Nomor kamar.
* Harga sewa.
* Fasilitas.
* Peraturan.
* Informasi properti.
* Informasi owner/pengelola.

---

# 10.3 Rent Management

Tenant dapat melihat:

* Current bill.
* Due date.
* Payment status.
* Payment history.
* Invoice.

### Payment Status

```text
PAID
PENDING
OVERDUE
FAILED
CANCELLED
```

---

# 10.4 Payment Flow

```text
Tenant
   ↓
Open Bill
   ↓
Pay Now
   ↓
Payment Gateway
   ↓
Payment Processing
   ↓
Webhook
   ↓
NestJS Backend
   ↓
Update Payment
   ↓
PostgreSQL
   ↓
Notification
   ↓
Payment Successful
```

Payment gateway dapat menggunakan:

* Midtrans
* Xendit

---

# 11. Maintenance Management

Maintenance merupakan salah satu fitur utama RentMate.

## 11.1 Tenant Creates Report

Tenant mengisi:

```text
Category
Description
Photo
Priority
```

Contoh:

> AC kamar tidak dingin sejak kemarin.

---

# 11.2 AI Maintenance Classification

Backend mengirimkan laporan ke AI.

AI menganalisis:

```text
Category
Priority
Summary
Suggested Action
```

Contoh:

```text
Input:

"AC kamar saya tidak dingin."

AI Output:

Category:
Air Conditioner

Priority:
HIGH

Summary:
Air conditioning unit is not cooling properly.

Suggested Action:
Inspect AC filter, refrigerant,
and compressor.
```

AI **tidak boleh menentukan keputusan teknis yang berbahaya secara otomatis**. Output AI harus dianggap sebagai recommendation dan owner/technician tetap menjadi pengambil keputusan.

---

# 11.3 Maintenance Ticket

Setiap laporan menghasilkan ticket.

```text
Maintenance #MT-1021

Room
A-12

Category
Air Conditioner

Priority
HIGH

Status
ASSIGNED

Assigned Technician
Budi

Created
18 Aug 2026
```

---

# 11.4 Maintenance Status

```text
REPORTED
    ↓
REVIEWING
    ↓
ASSIGNED
    ↓
IN_PROGRESS
    ↓
RESOLVED
    ↓
CLOSED
```

---

# 11.5 Technician Workflow

```text
Technician
    ↓
View Assigned Jobs
    ↓
Open Ticket
    ↓
Start Work
    ↓
IN_PROGRESS
    ↓
Complete Work
    ↓
Upload Proof
    ↓
RESOLVED
```

Technician dapat menambahkan:

```text
Work Summary
Materials Used
Cost
Before Photo
After Photo
```

---

# 11.6 Maintenance History

Owner dapat melihat:

```text
Room A-12

Maintenance History

18 Aug
AC
HIGH
Resolved

11 Aug
Water Leak
MEDIUM
Resolved

03 Aug
AC
HIGH
Resolved
```

Data ini kemudian digunakan untuk AI Analytics.

---

# 12. AI Smart Assistant

AI merupakan differentiator utama RentMate.

## 12.1 Owner Assistant

Owner dapat bertanya menggunakan natural language.

Contoh:

> "Kamar mana yang paling sering bermasalah bulan ini?"

AI:

```text
SMART INSIGHT

Room A-12 has the highest number
of maintenance reports this month.

3 reports detected:

• AC — Aug 03
• Water — Aug 11
• AC — Aug 18

Recommendation:

Consider inspecting the AC unit
before the next tenant cycle.
```

---

# 12.2 Supported AI Queries

Contoh:

```text
"Kamar mana yang paling sering bermasalah?"

"Berapa pemasukan bulan ini?"

"Berapa tenant yang belum bayar?"

"Maintenance apa yang paling sering terjadi?"

"Bandingkan revenue bulan ini dengan bulan lalu."

"Properti mana yang memiliki occupancy tertinggi?"
```

---

# 12.3 AI Insight Engine

AI dapat menghasilkan insight secara berkala:

```text
DATA
 │
 ├── Payments
 ├── Occupancy
 ├── Maintenance
 └── Rooms
        ↓
Analytics Service
        ↓
AI Insight Engine
        ↓
Smart Recommendations
```

---

# 13. Analytics

## Owner Analytics

### Revenue

```text
Monthly Revenue
Weekly Revenue
Payment Collection Rate
Outstanding Payments
```

### Occupancy

```text
Occupancy Rate
Available Rooms
Occupied Rooms
Vacancy Rate
```

### Maintenance

```text
Total Requests
Average Resolution Time
Most Common Issue
Most Problematic Room
Maintenance Cost
```

---

# 14. Notification System

Notification digunakan untuk:

### Tenant

* Rent reminder.
* Payment success.
* Payment failed.
* Maintenance status update.
* Owner announcement.

### Owner

* New payment.
* Overdue payment.
* New maintenance report.
* High priority issue.
* Maintenance resolved.

### Technician

* New assignment.
* Assignment updated.
* Job reminder.

---

# 15. Notification Channels

MVP:

```text
In-App Notification
Push Notification
Email
```

Future:

```text
WhatsApp
SMS
```

---

# 16. Search & Filtering

Owner harus dapat melakukan pencarian:

```text
Search room...
Search tenant...
Search maintenance...
```

Filtering:

```text
Room Status
Payment Status
Maintenance Status
Priority
Date
Property
```

---

# 17. File & Image Upload

Digunakan untuk:

* Property photos.
* Room photos.
* Tenant avatar.
* Maintenance photos.
* Payment proof jika diperlukan.
* Technician completion proof.

Storage:

**Cloudinary** atau object storage S3-compatible.

---

# 18. Database Design

## Entity Relationship

```text
users
  │
  ├──────── user_profiles
  │
  ├──────── properties
  │              │
  │              └──── rooms
  │                       │
  │                       └──── room_assignments
  │                                      │
  │                                      └──── users
  │
  ├──────── payments
  │
  ├──────── maintenance_requests
  │
  └──────── notifications
```

---

# 19. Database Tables

## users

Authentication dan authorization saja.

```text
id
email
password_hash
role
is_verified
provider
provider_id
last_login_at
created_at
updated_at
```

---

## user_profiles

```text
id
user_id
full_name
username
avatar_url
phone_number
birth_date
gender
created_at
updated_at
```

Business entity harus mereferensikan `users.id`, bukan `user_profiles.id`.

---

## properties

```text
id
owner_id
name
address
description
created_at
updated_at
```

---

## rooms

```text
id
property_id
room_number
floor
room_type
price
status
description
created_at
updated_at
```

---

## room_assignments

```text
id
room_id
tenant_id
start_date
end_date
status
created_at
updated_at
```

---

## payments

```text
id
tenant_id
room_id
amount
due_date
paid_at
status
payment_method
transaction_reference
created_at
updated_at
```

---

## maintenance_requests

```text
id
room_id
tenant_id
assigned_to
category
description
priority
status
ai_summary
ai_recommendation
estimated_cost
actual_cost
created_at
updated_at
resolved_at
```

---

## maintenance_attachments

```text
id
maintenance_request_id
file_url
file_type
created_at
```

---

## notifications

```text
id
user_id
title
message
type
is_read
created_at
```

---

## properties_facilities

```text
id
property_id
name
created_at
```

---

## payment_invoices

```text
id
payment_id
invoice_number
invoice_url
created_at
```

---

# 20. API Architecture

Backend menggunakan REST API.

Base:

```text
/api/v1
```

---

## Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
```

---

# Property API

```http
GET    /properties
POST   /properties
GET    /properties/:id
PATCH  /properties/:id
DELETE /properties/:id
```

---

# Room API

```http
GET    /properties/:id/rooms
POST   /properties/:id/rooms
GET    /rooms/:id
PATCH  /rooms/:id
DELETE /rooms/:id
```

---

# Tenant API

```http
GET    /tenants
GET    /tenants/:id
POST   /tenants/invite
POST   /rooms/:id/assign
DELETE /rooms/:id/assign
```

---

# Payment API

```http
GET  /payments
GET  /payments/:id
POST /payments/:id/checkout
POST /payments/webhook
GET  /payments/history
```

---

# Maintenance API

```http
GET   /maintenance
POST  /maintenance
GET   /maintenance/:id
PATCH /maintenance/:id
POST  /maintenance/:id/assign
POST  /maintenance/:id/start
POST  /maintenance/:id/resolve
POST  /maintenance/:id/close
```

---

# AI API

```http
POST /ai/maintenance/analyze
POST /ai/assistant
GET  /ai/insights
```

---

# Analytics API

```http
GET /analytics/overview
GET /analytics/revenue
GET /analytics/occupancy
GET /analytics/maintenance
```

---

# 21. Frontend Structure

## Tenant App

Technology:

```text
Flutter
Dart
Riverpod
Dio
GoRouter
```

Screens:

```text
Splash
 │
Onboarding
 │
Login / Register
 │
Tenant Home
 ├── Room
 ├── Rent
 ├── Payment
 ├── Maintenance
 ├── Notifications
 └── Profile
```

---

# 22. Owner Dashboard

Technology:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
Recharts
```

Pages:

```text
/dashboard
/properties
/properties/:id
/rooms
/tenants
/payments
/maintenance
/maintenance/:id
/analytics
/ai-assistant
/notifications
/settings
```

---

# 23. Design System

## Design Direction

**Modern SaaS + Friendly Property Management**

RentMate harus terlihat:

* Clean
* Friendly
* Professional
* Modern
* Trustworthy
* Accessible

Hindari desain yang terlalu:

* corporate
* penuh gradient
* terlalu banyak glassmorphism
* terlalu banyak warna
* terlihat seperti template dashboard generik

---

# 24. Color System

### Primary

Gunakan satu warna utama sebagai brand color.

Contoh:

```text
Primary
#5B5FEF
```

### Neutral

```text
Background
#F8FAFC

Surface
#FFFFFF

Border
#E5E7EB

Text Primary
#111827

Text Secondary
#6B7280
```

### Semantic

```text
Success
Green

Warning
Amber

Error
Red

Info
Blue
```

---

# 25. Typography

Recommended:

```text
Inter
```

atau

```text
Geist
```

Hierarchy:

```text
Display
32–40px

Heading
24–28px

Subheading
18–20px

Body
14–16px

Caption
12–13px
```

---

# 26. UI Components

Gunakan:

```text
Cards
Tables
Charts
Badges
Dialogs
Dropdowns
Tabs
Forms
Command Menu
Toast
Skeleton
Empty State
Confirmation Dialog
```

UI foundation:

**shadcn/ui**

Icon:

**Lucide**

---

# 27. Owner Navigation

Desktop:

```text
┌───────────────────────────────┐
│ RentMate                      │
│                               │
│ Overview                      │
│ Properties                    │
│ Rooms                         │
│ Tenants                       │
│ Payments                      │
│ Maintenance                   │
│ Analytics                     │
│ AI Assistant                  │
│ Notifications                 │
│                               │
│ Settings                      │
└───────────────────────────────┘
```

---

# 28. Tenant Navigation

Mobile:

```text
Home
Rent
Maintenance
Notifications
Profile
```

Navigation harus menggunakan bottom navigation agar mudah digunakan dengan satu tangan.

---

# 29. Core User Flows

## Flow 1 — Owner Registration

```text
Landing
 ↓
Register
 ↓
Select Owner
 ↓
Create Account
 ↓
Email Verification
 ↓
Create Property
 ↓
Add Rooms
 ↓
Owner Dashboard
```

---

# 30. Flow 2 — Tenant Invitation

```text
Owner
 ↓
Property
 ↓
Room A-12
 ↓
Assign Tenant
 ↓
Enter Tenant Email
 ↓
Invitation Sent
 ↓
Tenant Accepts
 ↓
Tenant Account Created
 ↓
Room Connected
```

---

# 31. Flow 3 — Rent Payment

```text
Tenant
 ↓
Dashboard
 ↓
Rent
 ↓
Current Bill
 ↓
Pay Now
 ↓
Payment Gateway
 ↓
Success
 ↓
Webhook
 ↓
Payment Updated
 ↓
Invoice Generated
 ↓
Notification
```

---

# 32. Flow 4 — Maintenance

```text
Tenant
 ↓
Report Issue
 ↓
Description + Photo
 ↓
Submit
 ↓
AI Classification
 ↓
Ticket Created
 ↓
Owner Notification
 ↓
Owner Reviews
 ↓
Assign Technician
 ↓
Technician Starts
 ↓
In Progress
 ↓
Resolve
 ↓
Tenant Notification
 ↓
Closed
```

---

# 33. Flow 5 — AI Insight

```text
Owner
 ↓
AI Assistant
 ↓
Ask Question
 ↓
Intent Detection
 ↓
Fetch Relevant Data
 ↓
Analytics Service
 ↓
AI
 ↓
Generate Insight
 ↓
Display Answer
```

Important:

AI sebaiknya tidak memiliki akses langsung ke database.

Architecture:

```text
AI
 ↓
AI Service
 ↓
Validated Tools / Queries
 ↓
Database
```

Bukan:

```text
AI
 ↓
Raw Database
```

---

# 34. Non-Functional Requirements

## Performance

Target:

* Initial page load < 3 seconds pada kondisi normal.
* API response rata-rata < 500ms untuk operasi standar.
* Pagination wajib untuk data dalam jumlah besar.

---

## Security

Wajib menggunakan:

```text
HTTPS
JWT
Refresh Token
Password Hashing
RBAC
Input Validation
Rate Limiting
CORS
Secure Headers
```

Password menggunakan:

```text
bcrypt
```

atau algoritma password hashing yang sesuai.

---

# 35. Authorization

Backend harus melakukan authorization.

Contoh:

Owner A:

```text
/property/123
```

tidak boleh mengakses:

```text
/property/456
```

milik Owner B.

Authorization harus diverifikasi di backend, bukan hanya menyembunyikan menu pada frontend.

---

# 36. Data Validation

Semua request harus divalidasi.

Contoh:

```text
Email
→ valid email

Amount
→ positive number

Due Date
→ valid date

Room Number
→ required

Maintenance Description
→ minimum character
```

---

# 37. Error Handling

API menggunakan struktur error konsisten.

Contoh:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid payment request",
  "errors": []
}
```

Frontend harus memiliki:

* Error state
* Retry
* Toast
* Empty state
* Loading state
* Skeleton

---

# 38. AI Safety & Reliability

AI bukan sumber kebenaran utama.

Untuk data finansial:

```text
Database
   ↓
Calculation
   ↓
AI Explanation
```

Bukan:

```text
Database
   ↓
AI menghitung sendiri
```

Contoh:

Revenue harus dihitung oleh backend:

```text
SUM(successful payments)
```

Kemudian AI hanya menjelaskan:

> Revenue meningkat 12% dibandingkan bulan sebelumnya.

---

# 39. Tech Stack

## Frontend Tenant

```text
Flutter
Dart
Riverpod
Dio
GoRouter
```

## Owner Dashboard

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
Recharts
```

## Backend

```text
NestJS
TypeScript
REST API
JWT
bcrypt
```

## Database

```text
PostgreSQL
Drizzle ORM
```

## AI

```text
OpenAI API
```

## Cache

```text
Redis
```

## Storage

```text
Cloudinary
```

## Notification

```text
Firebase Cloud Messaging
```

## Payment

```text
Midtrans / Xendit
```

## Deployment

```text
Vercel
Railway / VPS
Docker
```

---

# 40. Backend Architecture

Gunakan modular architecture:

```text
src/
│
├── auth/
├── users/
├── profiles/
├── properties/
├── rooms/
├── tenants/
├── payments/
├── maintenance/
├── notifications/
├── analytics/
├── ai/
├── uploads/
│
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
│
├── database/
│
└── main.ts
```

---

# 41. Frontend Architecture

## Next.js

```text
app/
├── (auth)/
│   ├── login/
│   └── register/
│
├── dashboard/
├── properties/
├── rooms/
├── tenants/
├── payments/
├── maintenance/
├── analytics/
├── ai-assistant/
├── notifications/
└── settings/
```

Components:

```text
components/
├── ui/
├── dashboard/
├── property/
├── room/
├── payment/
├── maintenance/
├── analytics/
└── ai/
```

---

# 42. MVP Scope

Untuk project bootcamp, MVP harus dibatasi.

## Must Have

### Authentication

* Register
* Login
* Logout
* Role

### Owner

* Dashboard
* Property management
* Room management
* Tenant management
* Payment management
* Maintenance management

### Tenant

* Dashboard
* Room information
* Rent information
* Payment
* Maintenance report

### Technician

* Assigned maintenance
* Update maintenance status

### Smart

* AI maintenance classification
* AI owner assistant
* Basic analytics

### System

* Notification
* File upload
* RBAC
* Responsive UI

---

# 43. Nice to Have

Jika MVP selesai:

* Recurring rent generation
* Automated payment reminder
* Advanced analytics
* Maintenance cost tracking
* Technician rating
* Tenant announcement
* Multiple properties per owner
* Export CSV/PDF
* Dark mode

---

# 44. Future Features

## Phase 2

```text
WhatsApp Integration
Smart Billing
Advanced AI Analytics
Tenant Chat
Digital Contract
E-Signature
```

## Phase 3

```text
IoT Smart Kost
Smart Door Lock
Electricity Monitoring
Water Monitoring
Automated Access Control
```

---

# 45. Out of Scope untuk MVP

Agar project tetap realistis:

* Real-time GPS technician tracking.
* IoT integration.
* Automated legal contract generation.
* Full accounting system.
* Multi-country payment.
* Cryptocurrency payment.
* Complex property marketplace.
* Fully autonomous AI decision making.

---

# 46. Success Metrics

## Owner

```text
Payment Collection Rate
Occupancy Rate
Average Maintenance Resolution Time
Overdue Payment Rate
```

## Tenant

```text
Payment Success Rate
Maintenance Response Time
Notification Open Rate
```

## Product

```text
Monthly Active Users
Active Properties
Total Rooms
Total Transactions
Total Maintenance Tickets
```

---

# 47. Demo Scenario

Untuk presentasi bootcamp, gunakan satu scenario end-to-end.

## Scenario

Owner memiliki kost:

```text
Kost Harmoni

42 Rooms
38 Occupied
4 Available
```

Tenant bernama:

```text
Andi
Room A-12
```

Andi mengalami masalah:

> "AC kamar saya tidak dingin."

---

## Step 1

Andi membuka RentMate.

```text
Maintenance
 ↓
Report Issue
```

Upload foto AC.

---

## Step 2

AI menganalisis:

```text
Category
AC

Priority
HIGH

Summary
AC is not cooling properly.
```

---

## Step 3

Owner menerima:

```text
🔧 New Maintenance Request

Room A-12
AC Issue
Priority: HIGH
```

---

## Step 4

Owner assign:

```text
Technician: Budi
```

---

## Step 5

Budi membuka aplikasi:

```text
Assigned Jobs

MT-1021
Room A-12
AC
HIGH
```

Budi mengubah:

```text
ASSIGNED
 ↓
IN_PROGRESS
```

---

## Step 6

Setelah selesai:

```text
Upload After Photo
 ↓
Work Summary
 ↓
RESOLVED
```

---

## Step 7

Andi menerima:

```text
✓ Maintenance Resolved

Your AC maintenance request
has been resolved.
```

---

## Step 8

AI Analytics memperbarui:

```text
Room A-12

Maintenance this month: 3

Most common issue:
AC

Recommendation:
Schedule preventive AC maintenance.
```

Flow ini menjadi **main demo flow** saat presentasi.

---

# 48. Development Roadmap

## Sprint 1 — Foundation

```text
Day 1
Project setup

Day 2
Database

Day 3
Authentication

Day 4
RBAC

Day 5
User profile
```

---

## Sprint 2 — Property

```text
Property CRUD
Room CRUD
Property dashboard
Room assignment
```

---

## Sprint 3 — Tenant

```text
Tenant management
Tenant invitation
Tenant dashboard
Room information
```

---

## Sprint 4 — Payment

```text
Payment model
Billing
Payment status
Payment gateway
Webhook
Invoice
```

---

## Sprint 5 — Maintenance

```text
Create ticket
Upload image
Maintenance status
Technician assignment
Technician workflow
History
```

---

## Sprint 6 — AI

```text
AI classification
AI summary
AI recommendation
AI assistant
AI analytics
```

---

## Sprint 7 — Polish

```text
Notification
Loading state
Error state
Empty state
Responsive design
Security
Testing
```

---

## Sprint 8 — Deployment

```text
Docker
Production database
Environment variables
CI/CD
Deployment
Monitoring
Final testing
```

---

# 49. Testing Strategy

## Unit Testing

Backend:

```text
Auth
Payment
Maintenance
Analytics
```

## Integration Testing

```text
Register → Login
Payment → Webhook
Maintenance → Assignment
```

## E2E Testing

Main flow:

```text
Tenant reports issue
 ↓
AI analyzes
 ↓
Owner receives request
 ↓
Owner assigns technician
 ↓
Technician resolves
 ↓
Tenant receives notification
```

---

# 50. Environment Variables

Contoh:

```env
DATABASE_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

OPENAI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=

REDIS_URL=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Secrets tidak boleh dimasukkan ke Git repository.

---

# 51. Deployment Architecture

```text
                    INTERNET
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
       Vercel                    Mobile
          │                       Flutter
       Next.js                       │
          │                          │
          └───────────┬──────────────┘
                      ↓
                  NestJS API
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
      PostgreSQL    Redis      Storage
          │                       │
       Railway                Cloudinary
          │
          ↓
       AI Service
          │
          ↓
     OpenAI API
```

---

# 52. Security Checklist

Before production:

```text
[ ] HTTPS
[ ] Password hashing
[ ] JWT expiration
[ ] Refresh token rotation
[ ] RBAC
[ ] Input validation
[ ] Rate limiting
[ ] CORS configuration
[ ] File upload validation
[ ] File size limitation
[ ] SQL injection protection
[ ] XSS protection
[ ] CSRF consideration
[ ] Secure environment variables
[ ] API authorization
[ ] Audit logs
```

---

# 53. Definition of Done

Feature dianggap selesai jika:

```text
[ ] UI selesai
[ ] API selesai
[ ] Database connected
[ ] Validation implemented
[ ] Authorization implemented
[ ] Loading state
[ ] Error state
[ ] Empty state
[ ] Mobile responsive
[ ] Tested
[ ] Documentation updated
```

---

# 54. Final Product Structure

Pada akhirnya RentMate akan terdiri dari:

```text
                     RENTMATE
                        │
          ┌─────────────┴─────────────┐
          │                           │
       TENANT                       OWNER
      Flutter                     Next.js
          │                           │
          └─────────────┬─────────────┘
                        ↓
                    NESTJS API
                        │
       ┌────────────────┼────────────────┐
       ↓                ↓                ↓
   PostgreSQL          Redis           Storage
       │                                 │
       └────────────────┬────────────────┘
                        ↓
                   SMART ENGINE
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
         Analytics                AI
              │                   │
              └─────────┬─────────┘
                        ↓
                  Smart Insights
```

---

# 55. Product Positioning

RentMate bukan:

> "Aplikasi untuk bayar kost."

RentMate adalah:

> **Smart operating platform untuk pengelolaan properti kost.**

Core value:

```text
MANAGE
Property + Rooms + Tenants

COLLECT
Rent + Payments + Invoices

RESOLVE
Maintenance + Technicians

UNDERSTAND
Analytics + AI Insights
```

---

# 56. Pitch

### Short Pitch

> **RentMate is a smart kost management platform that connects property owners, tenants, and technicians in one place — simplifying rent payments, maintenance, communication, and property analytics with the help of AI.**

### Indonesian Pitch

> **RentMate adalah platform manajemen kost pintar yang menghubungkan pemilik kost, penghuni, dan teknisi dalam satu ekosistem untuk mengelola kamar, pembayaran, maintenance, serta analytics secara lebih terstruktur dengan bantuan AI.**

---

# 57. Recommended MVP Priority

Urutan pengerjaan yang direkomendasikan:

```text
                    RENTMATE MVP
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      FOUNDATION        CORE          SMART
          │              │              │
      Auth/RBAC       Property         AI
      Profile         Room             Analytics
                      Tenant
                      Payment
                      Maintenance
                         │
                         ↓
                      POLISH
                         │
                  Notification
                  Responsive UI
                  Security
                  Testing
                         │
                         ↓
                     DEPLOYMENT
```

**Prioritas absolut:**

1. Authentication + RBAC
2. Property & Room Management
3. Tenant Management
4. Payment
5. Maintenance
6. AI Maintenance Classification
7. Analytics
8. Notification
9. Polish & Deployment

Dengan urutan ini, apabila waktu bootcamp ternyata terbatas, RentMate tetap memiliki **core product yang usable**, sementara AI dan fitur tambahan dapat menjadi layer terakhir.
