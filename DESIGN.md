# RentMate — UI/UX Design System

> **Modern. Professional. Calm. Human.**

RentMate adalah platform smart kost management yang digunakan oleh owner, tenant, dan technician. Design system ini dibuat untuk menghasilkan interface yang modern, profesional, mudah digunakan, dan nyaman dilihat dalam penggunaan jangka panjang.

---

# 1. Design Philosophy

RentMate harus terasa seperti:

* Modern SaaS
* Professional property management platform
* Friendly
* Calm
* Trustworthy
* Accessible
* Clean
* Efficient

RentMate **tidak boleh** terasa seperti:

* Dashboard template generik
* AI-generated UI
* Terlalu banyak gradient
* Terlalu banyak glassmorphism
* Dashboard penuh card
* Terlalu banyak warna
* Interface yang terlalu corporate
* Interface yang terlalu playful

## Design Principle

### 1. Calm by Default

User akan sering membuka RentMate untuk mengecek pembayaran, kamar, atau maintenance.

Karena itu interface harus tenang dan tidak melelahkan mata.

### 2. Information First

UI harus membantu user memahami informasi dengan cepat.

Contoh:

```text
Rp 57.000.000
Monthly Revenue

↑ 12.4% from last month
```

Lebih baik daripada:

```text
Revenue
Some additional information...
[Large decorative chart]
```

### 3. Visual Hierarchy

Informasi penting harus langsung terlihat.

Prioritas:

```text
Primary Information
        ↓
Secondary Information
        ↓
Supporting Information
        ↓
Actions
```

### 4. Consistency

Komponen yang sama harus memiliki behaviour yang sama di seluruh aplikasi.

---

# 2. Brand Personality

RentMate memiliki personality:

```text
Professional
       +
Friendly
       +
Reliable
       +
Smart
```

Bukan:

```text
Corporate
   +
Cold
   +
Complex
```

---

# 3. Target Experience

## Owner

Owner harus merasa:

> "Saya bisa mengetahui kondisi kost saya hanya dalam beberapa detik."

## Tenant

Tenant harus merasa:

> "Saya tidak perlu chat owner hanya untuk mengetahui tagihan atau status maintenance."

## Technician

Technician harus merasa:

> "Saya tahu pekerjaan apa yang harus saya kerjakan dan apa yang harus dilakukan."

---

# 4. Visual Direction

Design direction:

> **Soft Modern SaaS**

Karakter visual:

* White / soft neutral background
* Rounded but not excessive
* Thin borders
* Subtle shadows
* Strong typography
* Minimal decoration
* Clear status colors
* Plenty of whitespace

---

# 5. Color System

## Primary

```text
Primary
#5B5FEF
```

Digunakan untuk:

* Primary button
* Active navigation
* Links
* Important interactive elements
* Brand elements

Primary harus digunakan secara terkontrol.

Jangan menggunakan primary color pada semua elemen.

---

## Background

```text
Background
#F8FAFC

Surface
#FFFFFF

Surface Secondary
#F1F5F9
```

Background utama menggunakan soft neutral agar dashboard terasa ringan.

---

## Text

```text
Text Primary
#111827

Text Secondary
#64748B

Text Muted
#94A3B8

Text Disabled
#CBD5E1
```

---

## Border

```text
Border
#E2E8F0

Border Strong
#CBD5E1
```

Gunakan border tipis daripada shadow berat.

---

# 6. Semantic Colors

## Success

```text
Success
#16A34A

Success Background
#F0FDF4
```

Digunakan untuk:

* Paid
* Resolved
* Available
* Successful payment

---

## Warning

```text
Warning
#D97706

Warning Background
#FFFBEB
```

Digunakan untuk:

* Pending
* Approaching due date
* Medium priority

---

## Error

```text
Error
#DC2626

Error Background
#FEF2F2
```

Digunakan untuk:

* Overdue
* Failed payment
* Critical maintenance

---

## Info

```text
Info
#2563EB

Info Background
#EFF6FF
```

Digunakan untuk:

* Information
* In progress
* System notification

---

# 7. Color Usage Rule

Gunakan rule:

```text
60% Neutral
30% Surface / Secondary
10% Brand / Semantic
```

Jangan membuat seluruh dashboard menggunakan warna primary.

Color harus digunakan untuk:

> **communicate information, not decorate the UI.**

---

# 8. Typography

Primary font:

> **Inter**

Alternative:

> **Geist**

Typography harus memiliki hierarchy yang jelas.

---

## Display

```text
40px
Font Weight: 600
Line Height: 1.1
```

Digunakan untuk:

* Landing page
* Major statistics

---

## H1

```text
32px
Font Weight: 600
Line Height: 1.2
```

---

## H2

```text
24px
Font Weight: 600
Line Height: 1.3
```

---

## H3

```text
18px
Font Weight: 600
Line Height: 1.4
```

---

## Body

```text
14–16px
Font Weight: 400
Line Height: 1.5
```

---

## Caption

```text
12–13px
Font Weight: 400–500
```

---

# 9. Typography Rules

Jangan menggunakan terlalu banyak font weight.

Recommended:

```text
400 — Regular
500 — Medium
600 — Semibold
```

Weight 700 hanya digunakan jika benar-benar diperlukan.

---

# 10. Spacing System

Gunakan base unit:

```text
4px
```

Scale:

```text
4
8
12
16
20
24
32
40
48
64
80
```

Contoh:

```text
Card padding
24px

Section gap
32px

Page padding
32px

Small component gap
8px
```

---

# 11. Border Radius

RentMate menggunakan rounded UI, tetapi tidak terlalu bubbly.

```text
Small
6px

Default
10px

Medium
12px

Large
16px

Modal
20px

Pill
999px
```

Recommended default:

> **12px**

---

# 12. Shadow

Gunakan shadow secara minimal.

Default card:

```text
0 1px 2px rgba(15, 23, 42, 0.04)
```

Elevated:

```text
0 8px 24px rgba(15, 23, 42, 0.08)
```

Shadow hanya digunakan ketika elemen membutuhkan elevation.

Prefer:

```text
Border + subtle shadow
```

daripada:

```text
Large shadow
```

---

# 13. Layout System

Owner dashboard menggunakan:

```text
Sidebar
+
Topbar
+
Main Content
```

Desktop:

```text
┌───────────────────────────────────────────────┐
│ Sidebar │ Topbar                              │
│         ├─────────────────────────────────────┤
│         │                                     │
│         │ Main Content                        │
│         │                                     │
│         │                                     │
│         │                                     │
└───────────────────────────────────────────────┘
```

---

# 14. Sidebar

Width:

```text
240px
```

Collapsed:

```text
72px
```

Sidebar:

```text
RentMate
────────────────

Overview

Properties
Rooms
Tenants

Payments
Maintenance

Analytics
AI Assistant

────────────────

Notifications
Settings

Profile
```

Active item:

```text
Background: subtle primary tint
Text: Primary
Icon: Primary
Radius: 8–10px
```

Sidebar tidak boleh terlalu penuh.

---

# 15. Topbar

Topbar berisi:

```text
Page Title

Search

Notifications

Profile
```

Contoh:

```text
Overview                         🔍   🔔   JD
Good morning, John
```

Topbar harus tetap sederhana.

---

# 16. Page Header

Setiap halaman menggunakan struktur:

```text
Page Title
Short description

                         [Primary Action]
```

Contoh:

```text
Properties
Manage your kost properties and rooms.

                         + Add Property
```

---

# 17. Dashboard Design

Dashboard harus memprioritaskan informasi.

Recommended structure:

```text
Welcome Header
       ↓
KPI Cards
       ↓
Revenue + Occupancy
       ↓
Payment + Maintenance
       ↓
Recent Activity
       ↓
AI Insight
```

---

# 18. KPI Cards

Contoh:

```text
┌───────────────────────────┐
│ Monthly Revenue       ↗   │
│                           │
│ Rp57.000.000              │
│                           │
│ ↑ 12.4% vs last month     │
└───────────────────────────┘
```

Card tidak perlu icon besar.

Icon cukup kecil di bagian atas atau kanan.

---

# 19. KPI Card Rules

Setiap KPI harus memiliki:

```text
Label
Value
Comparison / Status
Optional Icon
```

Hindari:

```text
Huge icon
Huge gradient
Too much decoration
```

---

# 20. Charts

Gunakan chart yang sederhana.

Recommended:

* Line chart
* Area chart
* Bar chart
* Donut chart

Hindari:

* 3D chart
* Excessive gradients
* Too many colors
* Decorative charts

---

# 21. Revenue Chart

```text
Revenue

Rp60M ┤              ╭──╮
Rp50M ┤        ╭──────╯  ╰─╮
Rp40M ┤   ╭────╯           ╰
Rp30M ┤───╯
      └────────────────────────
       Jan Feb Mar Apr May Jun
```

Gunakan satu primary color.

---

# 22. Occupancy Visualization

Gunakan:

```text
Occupied
38

Available
4

Maintenance
2
```

Visual:

```text
██████████████████░░░
90% Occupied
```

Jangan membuat occupancy chart terlalu kompleks.

---

# 23. Room Management

Room page dapat menggunakan kombinasi:

```text
Filter
Search
Room Cards / Table
```

Room card:

```text
┌──────────────────────────┐
│ A-12              ● OCCUPIED
│                          │
│ Rp1.500.000 / month      │
│                          │
│ Andi                     │
│ Next payment: Sep 12     │
│                          │
│ View Room →              │
└──────────────────────────┘
```

---

# 24. Room Status

Status menggunakan badge.

```text
● Available
● Occupied
● Maintenance
```

Warna semantic harus konsisten di seluruh aplikasi.

---

# 25. Property Card

```text
┌──────────────────────────────┐
│                              │
│        Property Image        │
│                              │
├──────────────────────────────┤
│ Kost Harmoni                 │
│ Jakarta Selatan              │
│                              │
│ 42 Rooms   90% Occupancy     │
│                              │
│ View Property →              │
└──────────────────────────────┘
```

Image menggunakan aspect ratio konsisten.

---

# 26. Table Design

Table digunakan untuk:

* Tenants
* Payments
* Maintenance
* Rooms

Contoh:

```text
Tenant

Name       Room    Rent       Status
──────────────────────────────────────
Andi       A-12    1.5M       Paid
Budi       A-13    1.5M       Pending
Sarah      B-02    1.8M       Paid
```

Table harus memiliki:

* Comfortable row height
* Clear alignment
* Subtle divider
* Sticky header bila diperlukan
* Pagination

---

# 27. Table Rules

Jangan:

* menggunakan border di setiap sisi cell
* menggunakan terlalu banyak warna
* membuat row terlalu padat

Gunakan:

```text
64px minimum row height
```

untuk data utama.

---

# 28. Payment UI

Payment status:

```text
Paid
Pending
Overdue
Failed
Cancelled
```

Contoh:

```text
┌──────────────────────────────────────┐
│ September Rent                       │
│                                      │
│ Rp1.500.000                          │
│ Due Sep 12, 2026                     │
│                                      │
│ ● Pending                            │
│                                      │
│                     [Pay Now]        │
└──────────────────────────────────────┘
```

---

# 29. Payment Success

Gunakan success state yang tenang.

```text
✓

Payment Successful

Rp1.500.000

September rent has been paid.

[ View Invoice ]
```

Tidak perlu animasi berlebihan.

---

# 30. Overdue Payment

```text
⚠ Payment Overdue

September rent
Rp1.500.000

Due Sep 12

[ Pay Now ]
```

Gunakan error color hanya pada informasi penting.

---

# 31. Maintenance UI

Maintenance merupakan feature yang membutuhkan visual hierarchy kuat.

Ticket:

```text
┌────────────────────────────────────────┐
│ #MT-1021                         HIGH   │
│                                        │
│ Air Conditioner                        │
│ Room A-12                              │
│                                        │
│ "AC tidak dingin sejak kemarin."       │
│                                        │
│ ● In Progress                          │
│                                        │
│ Assigned to Budi                       │
└────────────────────────────────────────┘
```

---

# 32. Maintenance Priority

```text
LOW
MEDIUM
HIGH
URGENT
```

Gunakan semantic color secara bertahap.

Jangan membuat semua priority terlihat seperti error.

---

# 33. Maintenance Detail

Structure:

```text
Issue
↓
Description
↓
Attachments
↓
AI Analysis
↓
Assignment
↓
Timeline
↓
Resolution
```

---

# 34. Maintenance Timeline

```text
● Resolved
│
│ Sep 03 — 14:32
│ Technician completed the repair.
│
● In Progress
│
│ Sep 03 — 11:20
│ Budi started working.
│
● Assigned
│
│ Sep 03 — 10:40
│ Assigned to Budi.
│
● Reported
  Sep 03 — 10:15
```

Timeline harus mudah dipindai.

---

# 35. AI Assistant Design

AI Assistant harus terasa seperti **product feature**, bukan chatbot gimmick.

Layout:

```text
┌─────────────────────────────────────────┐
│ RentMate Intelligence                   │
│ Ask about your property.                │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Which room has the most issues?     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Recent questions                        │
└─────────────────────────────────────────┘
```

---

# 36. AI Response

AI response harus berbentuk structured insight.

Contoh:

```text
Room A-12

3 maintenance reports
this month.

Most common issue:
Air Conditioner

Recommendation:
Schedule preventive maintenance
for the AC unit.
```

Jika data berasal dari database, tampilkan sumber data secara kontekstual.

Contoh:

```text
Based on 38 occupied rooms
and 24 maintenance records.
```

---

# 37. AI Visual Language

AI menggunakan:

* Soft primary tint
* Small sparkle icon
* Structured cards
* Clear headings

Hindari:

* Robot illustrations
* Huge gradient blobs
* Excessive purple gradient
* "AI magic" decoration

AI harus terasa sebagai **utility**, bukan gimmick.

---

# 38. Tenant Mobile UI

Tenant UI harus lebih simple daripada owner dashboard.

Bottom navigation:

```text
Home
Rent
Maintenance
Notifications
Profile
```

---

# 39. Tenant Home

```text
Good evening 👋

Your Room
A-12

Rp1.500.000
Monthly Rent

Due in 12 days

[ Pay Rent ]

──────────────────

Maintenance

AC Issue
In Progress

──────────────────

Upcoming

Rent payment
Sep 12
```

---

# 40. Mobile Navigation

Gunakan bottom navigation dengan maksimal:

```text
5 items
```

Active item menggunakan primary color.

Icon + label harus selalu jelas.

---

# 41. Tenant Maintenance

Mobile-first flow:

```text
Maintenance

[ + Report Issue ]

Active Requests

AC Issue
Room A-12
● In Progress
```

Create report:

```text
Report an Issue

What's wrong?

[ Select category ]

Tell us more

[ Description ]

Add photos

[ + ]

[ Submit Report ]
```

---

# 42. Forms

Form harus memiliki:

```text
Label
Input
Helper text
Error message
```

Contoh:

```text
Room Number

[ A-12 ]

Use the room number displayed
on your property.

✓ Valid room number
```

---

# 43. Input Style

Default:

```text
Height: 44–48px
Radius: 10px
Border: 1px
Padding: 12–14px
```

Focus:

```text
Primary border
Subtle focus ring
```

Jangan menggunakan outline yang terlalu tebal.

---

# 44. Buttons

## Primary

```text
+ Add Property
```

Style:

```text
Primary background
White text
10px radius
Medium weight
```

## Secondary

```text
Cancel
```

Style:

```text
White / transparent
Border
Dark text
```

## Destructive

```text
Delete Property
```

Gunakan hanya untuk tindakan destruktif.

---

# 45. Button Hierarchy

Satu halaman sebaiknya memiliki:

```text
1 Primary Action
0–2 Secondary Actions
```

Jangan membuat semua button terlihat primary.

---

# 46. Modal

Modal digunakan untuk:

* Confirmation
* Short forms
* Quick actions

Contoh:

```text
Delete Property?

This action cannot be undone.

[ Cancel ] [ Delete Property ]
```

Modal harus fokus pada satu keputusan.

---

# 47. Drawer

Gunakan drawer untuk:

* Quick room details
* Quick tenant details
* Maintenance preview

Contoh:

```text
Room A-12
────────────────

Tenant
Andi

Rent
Rp1.500.000

Status
Occupied

[ View Full Details ]
```

---

# 48. Toast

Toast digunakan untuk feedback singkat.

Success:

```text
✓ Property created successfully.
```

Error:

```text
Something went wrong.
Please try again.
```

Toast tidak boleh menyimpan informasi penting yang harus dibaca lama.

---

# 49. Loading State

Gunakan skeleton.

Contoh:

```text
┌──────────────────────┐
│ ███████              │
│                      │
│ ████████████         │
│ ████████             │
└──────────────────────┘
```

Hindari spinner pada seluruh halaman jika skeleton dapat digunakan.

---

# 50. Empty State

Empty state harus memberikan konteks + action.

Contoh:

```text
No properties yet

Add your first property to start
managing your rooms and tenants.

[ + Add Property ]
```

Jangan hanya:

```text
No data.
```

---

# 51. Error State

Contoh:

```text
Something went wrong

We couldn't load your maintenance
requests.

[ Try Again ]
```

Error harus human-friendly.

---

# 52. Responsive Design

## Desktop

```text
≥ 1280px
```

Full dashboard.

## Tablet

```text
768px – 1279px
```

Sidebar dapat collapse.

## Mobile

```text
< 768px
```

Owner dashboard tetap usable, tetapi tenant experience menjadi prioritas mobile.

---

# 53. Responsive Rules

Desktop:

```text
Sidebar
+
Content
```

Tablet:

```text
Collapsed Sidebar
+
Content
```

Mobile:

```text
Topbar
+
Content
+
Bottom Navigation
```

---

# 54. Accessibility

Target:

> WCAG 2.1 AA

Requirements:

* Minimum readable contrast
* Keyboard navigation
* Visible focus state
* Proper semantic HTML
* Accessible labels
* Touch target minimum ~44px
* Do not rely only on color to communicate status

Contoh:

Jangan:

```text
● red
```

Saja.

Gunakan:

```text
● Overdue
```

---

# 55. Iconography

Library:

> **Lucide Icons**

Style:

```text
Stroke
2px

Default Size
20px

Small
16px

Large
24px
```

Icon harus mendukung informasi, bukan menjadi dekorasi utama.

---

# 56. Illustration

RentMate menggunakan illustration secara terbatas.

Illustration hanya digunakan untuk:

* Empty state
* Onboarding
* Landing page
* Important success state

Dashboard utama tidak perlu penuh illustration.

---

# 57. Image Style

Property images harus:

* Natural
* Bright
* Clean
* Realistic
* Warm
* Trustworthy

Hindari stock photo yang terlalu staged.

---

# 58. Motion Design

Animation harus subtle.

Recommended:

```text
150ms
200ms
250ms
```

Gunakan untuk:

* Hover
* Modal
* Dropdown
* Page transition
* Toast
* Button feedback

Hindari:

* Excessive bounce
* Long animation
* Decorative animations
* Constant moving elements

---

# 59. Micro Interaction

Contoh payment:

```text
Pay Now
 ↓
Processing...
 ↓
✓ Payment Successful
```

Maintenance:

```text
Submit
 ↓
Creating ticket...
 ↓
✓ Request submitted
```

Interaction harus memberi feedback.

---

# 60. Landing Page

Landing page:

```text
NAVBAR
────────────────────────

Manage your kost
without the chaos.

Rent, maintenance, tenants,
and insights in one place.

[ Get Started ]
[ See how it works ]

                 Product Preview


TRUST / VALUE


Everything your kost needs

[ Property ]
[ Payments ]
[ Maintenance ]
[ Analytics ]


HOW IT WORKS

1. Add your property
2. Invite your tenants
3. Manage everything


SMART FEATURES

AI-powered maintenance insights


FINAL CTA


Manage your kost smarter.

[ Get Started ]
```

---

# 61. Landing Hero

Hero tidak boleh terlalu penuh.

Recommended:

```text
Small badge

SMART KOST MANAGEMENT

Large headline

Manage your kost
without the chaos.

Supporting paragraph

One platform for rooms,
rent, maintenance, and insights.

[ Get Started ]
[ Explore Features ]
```

Visual product preview berada di sisi kanan pada desktop.

---

# 62. Dashboard Density

RentMate harus menggunakan **medium information density**.

Jangan terlalu:

```text
Dense enterprise dashboard
```

tetapi juga jangan:

```text
Huge cards with very little information
```

Target:

> Informative, breathable, scannable.

---

# 63. Design Tokens

Implementasikan design tokens.

```css
:root {
  --color-primary: #5B5FEF;

  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-secondary: #F1F5F9;

  --color-text-primary: #111827;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;

  --color-border: #E2E8F0;

  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #2563EB;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

---

# 64. Component Architecture

Recommended structure:

```text
components/
│
├── ui/
│   ├── button/
│   ├── card/
│   ├── input/
│   ├── badge/
│   ├── dialog/
│   ├── dropdown/
│   ├── table/
│   ├── tabs/
│   ├── toast/
│   └── skeleton/
│
├── layout/
│   ├── sidebar/
│   ├── topbar/
│   └── mobile-navigation/
│
├── dashboard/
│   ├── stat-card/
│   ├── revenue-chart/
│   ├── occupancy-chart/
│   └── activity-list/
│
├── property/
│   ├── property-card/
│   ├── property-form/
│   └── property-overview/
│
├── room/
│   ├── room-card/
│   ├── room-table/
│   └── room-status/
│
├── payment/
│   ├── payment-card/
│   ├── payment-status/
│   └── invoice/
│
├── maintenance/
│   ├── ticket-card/
│   ├── ticket-timeline/
│   ├── priority-badge/
│   └── maintenance-form/
│
├── analytics/
│
└── ai/
    ├── assistant/
    ├── insight-card/
    └── recommendation/
```

---

# 65. Page Design Priority

Development UI harus mengikuti prioritas:

## P0

```text
Login
Register
Owner Dashboard
Tenant Dashboard
Property
Room
Payment
Maintenance
```

## P1

```text
Analytics
AI Assistant
Notifications
Profile
```

## P2

```text
Settings
Advanced Analytics
Dark Mode
```

---

# 66. Design QA Checklist

Sebelum sebuah halaman dianggap selesai:

```text
[ ] Typography consistent
[ ] Spacing consistent
[ ] Colors follow design tokens
[ ] Buttons have correct hierarchy
[ ] Loading state exists
[ ] Empty state exists
[ ] Error state exists
[ ] Mobile responsive
[ ] Keyboard accessible
[ ] Focus state exists
[ ] Status does not rely only on color
[ ] No unnecessary decoration
[ ] Visual hierarchy is clear
```

---

# 67. Anti AI-Slop Rules

RentMate harus mengikuti aturan berikut.

## DON'T

```text
❌ Huge gradient hero
❌ Purple-blue gradient everywhere
❌ Excessive glassmorphism
❌ Floating blobs
❌ Giant rounded cards
❌ Excessive emojis
❌ Random decorative icons
❌ Every section inside a card
❌ 10 different colors
❌ Excessive shadows
❌ AI-generated looking illustrations
```

## DO

```text
✓ Strong typography
✓ Real whitespace
✓ Clear hierarchy
✓ Subtle borders
✓ Restrained color
✓ Meaningful icons
✓ Useful data visualization
✓ Consistent spacing
✓ Human-friendly copy
✓ Purposeful animation
```

---

# 68. Core UI Principle

RentMate harus mengikuti prinsip:

> **"Less decoration, more clarity."**

User membuka RentMate bukan untuk melihat design yang keren.

User membuka RentMate untuk mengetahui:

```text
How much money came in?
Who hasn't paid?
Which room is available?
What needs maintenance?
What should I do next?
```

Design harus membantu menjawab pertanyaan tersebut secepat mungkin.

---

# 69. Final Visual Direction

RentMate secara visual dapat dirangkum sebagai:

```text
                    RENTMATE

        MODERN
           │
           ├── Clean typography
           ├── Soft neutral background
           ├── Subtle borders
           │
        PROFESSIONAL
           │
           ├── Structured dashboard
           ├── Clear data hierarchy
           ├── Consistent components
           │
        FRIENDLY
           │
           ├── Warm microcopy
           ├── Simple interactions
           └── Human-centered UX
           │
        SMART
           │
           ├── AI insights
           ├── Intelligent classification
           └── Data-driven recommendations
```

---

# 70. Design North Star

Setiap keputusan UI RentMate harus melewati empat pertanyaan:

### 01 — Is it clear?

Apakah user langsung memahami informasi?

### 02 — Is it useful?

Apakah elemen tersebut membantu user melakukan sesuatu?

### 03 — Is it calm?

Apakah interface nyaman dilihat dalam waktu lama?

### 04 — Is it consistent?

Apakah behavior dan visualnya konsisten dengan sistem?

Jika jawabannya tidak, komponen tersebut harus disederhanakan.

---

# Final Design Statement

> **RentMate is designed as a calm, modern, and professional property-management experience that puts clarity before decoration.**

Visual language RentMate menggabungkan:

```text
Modern SaaS
      +
Property Management
      +
Friendly Mobile UX
      +
Data-driven Dashboard
      +
Subtle AI Experience
```

Hasil akhirnya harus terasa seperti **produk SaaS sungguhan**, bukan project bootcamp yang sekadar memiliki banyak fitur.
