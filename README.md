# Apex - Production-Quality Product Admin Dashboard

A responsive, high-performance, accessible **Product Admin Dashboard** built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **Axios**, using the free [DummyJSON API](https://dummyjson.com).

![Apex Product Admin Dashboard](https://raw.githubusercontent.com/dummyjson/dummyjson/master/assets/dummyjson-banner.png)

---

## 🌟 Project Overview

Apex is a SaaS-grade Product Administration Portal designed for managing ecommerce product catalogs. It provides authentication, search, category filtering, server-side sorting, URL parameter state synchronization, responsive table & grid views, dynamic product detail inspection, and CRUD operations (Add, Edit, Delete) with session-persisted client-side mutation management.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Library**: React 18 & TypeScript
- **Styling**: Tailwind CSS (Pure Vanilla CSS utility classes, zero external UI libraries)
- **HTTP Client**: Axios (Shared instance with request/response interceptors & AbortSignal cancellation)
- **Icons**: Lucide React
- **Authentication**: JWT token & user persistence via secure client cookies (`js-cookie`)
- **API**: [DummyJSON API](https://dummyjson.com)

*Note: Built without React Query, SWR, or ready-made table/pagination libraries.*

---

## ✨ Features

- 🔐 **Authentication & Protection**
  - Live login via DummyJSON `POST /auth/login` (Demo credentials: `emilys` / `emilyspass`).
  - Double-click rapid submission protection.
  - Client-side token storage & route guard protection for `/products` paths.
  - Logout functionality with session teardown and redirect.

- 📊 **Product Dashboard**
  - **Desktop View**: Styled HTML table displaying thumbnail, title, category badge, price, star rating, stock badge, and action buttons.
  - **Mobile View**: Responsive card grid with identical field capabilities.
  - **Page Size Selector**: Configurable page limits (10, 20, 50).

- 🔗 **URL State Synchronization & Safe Normalization**
  - Query parameters (`page`, `limit`, `search`, `category`, `sort`) are bidirectionally bound to the URL (e.g. `/products?page=2&limit=20&search=phone&sort=price-asc`).
  - Refreshing or sharing URLs perfectly preserves the view.
  - Automatic normalization prevents app crashes on malformed params (e.g., `?page=-5` or `?limit=invalid` safely defaults).

- ⚡ **Debounced Search & Race Condition Protection**
  - Custom `useDebounce` hook (400ms delay) prevents rapid API requests during user typing.
  - **Axios Cancellation**: Pending search requests are explicitly cancelled using `AbortController` when a new query is initiated, ensuring stale search results NEVER overwrite newer results.

- 🏷️ **Category Filtering & Server/Client Sorting**
  - Dynamic category loading from `/products/categories`.
  - Sorting support by Price (asc/desc), Rating (desc), and Title (asc/desc).

- 📦 **CRUD Operations & Session Mutations**
  - **Details View**: `/products/[id]` showing image gallery, price, discount, specs, stock status, and customer reviews.
  - **Add Product**: `/products/new` with full client-side validation & submit lock.
  - **Edit Product**: `/products/[id]/edit` with pre-populated form fields.
  - **Delete Product**: Accessible confirmation modal with double-submission protection.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run TypeScript check
npx tsc --noEmit

# Run Next.js lint
npm run lint

# Build production package
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`.

---

## 🔑 Demo Credentials

To test the application login, use the official assignment credentials:

| Username | Password |
| :--- | :--- |
| `emilys` | `emilyspass` |

---

## 🌐 API Endpoints Used

All API requests are routed through the shared Axios client (`src/lib/axios.ts`):

- **Auth Login**: `POST https://dummyjson.com/auth/login`
- **Auth Me**: `GET https://dummyjson.com/auth/me`
- **Get Products**: `GET https://dummyjson.com/products?limit=20&skip=0&sortBy=price&order=asc`
- **Search Products**: `GET https://dummyjson.com/products/search?q={query}&limit=20&skip=0`
- **Category List**: `GET https://dummyjson.com/products/categories`
- **Get by Category**: `GET https://dummyjson.com/products/category/{category}`
- **Get Product by ID**: `GET https://dummyjson.com/products/{id}`
- **Add Product**: `POST https://dummyjson.com/products/add`
- **Update Product**: `PUT https://dummyjson.com/products/{id}`
- **Delete Product**: `DELETE https://dummyjson.com/products/{id}`

---

## 🏗️ Architecture & Folder Structure

```text
src/
├── app/
│   ├── login/
│   │   └── page.tsx            # Login page view
│   ├── products/
│   │   ├── page.tsx            # Dashboard main view (table/cards, filters, pagination)
│   │   ├── new/
│   │   │   └── page.tsx        # Add Product view
│   │   └── [id]/
│   │       ├── page.tsx        # Details view
│   │       └── edit/
│   │           └── page.tsx    # Edit Product view
│   ├── layout.tsx              # Root layout with Auth & Product providers
│   ├── page.tsx                # Index redirector
│   └── not-found.tsx           # Custom 404 page
│
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx       # Auth form with double submission protection
│   ├── layout/
│   │   └── Navbar.tsx          # Sticky top bar with profile & logout
│   ├── products/
│   │   ├── ProductTable.tsx    # Desktop HTML table view
│   │   ├── ProductCards.tsx    # Mobile card grid view
│   │   ├── ProductFilters.tsx  # Search input, category dropdown, sort, limit
│   │   ├── Pagination.tsx      # Accessible pagination bar with summary text
│   │   ├── ProductForm.tsx     # Reusable Add/Edit form component
│   │   └── DeleteModal.tsx     # Confirmation dialog modal
│   └── common/
│       ├── Skeleton.tsx        # Loading skeletons
│       ├── ErrorAlert.tsx      # Human-readable error banner with retry trigger
│       └── EmptyState.tsx      # Filter reset empty state
│
├── context/
│   ├── AuthContext.tsx         # Auth state management & token cookie handler
│   └── ProductContext.tsx      # Session-persisted local mutation store
│
├── services/
│   ├── authService.ts          # Auth API service
│   └── productService.ts       # Product CRUD API service with AbortSignal support
│
├── hooks/
│   ├── useDebounce.ts          # Generic value debouncing hook
│   └── useProductParams.ts     # URL query parameter synchronization & normalization
│
├── lib/
│   └── axios.ts                # Shared Axios instance with request/response interceptors
│
├── types/
│   ├── auth.ts                 # TypeScript auth interfaces
│   └── product.ts              # TypeScript product & query interfaces
│
└── utils/
    ├── cookies.ts              # Cookie helper functions
    └── formatters.ts           # Currency, category, and text formatting helpers
```

---

## 🧠 Key Technical Decisions

### 1. Search + Category API Limitation Handling
DummyJSON exposes separate endpoints for `/products/search?q=` and `/products/category/{cat}` but does not natively support combining search queries and category filters in a single request. 
**Design Solution**: When a search query is entered, the application queries the search endpoint and applies client-side category filtering on the returned search items. This guarantees accurate matching without making illegal or unsupported API requests.

### 2. DummyJSON Mutation Limitation & Session Persisted Overlay
DummyJSON simulates `POST`, `PUT`, and `DELETE` requests by returning successful mock JSON payloads without permanently saving changes to their server database. 
**Design Solution**: We built a `ProductContext` layer that captures additions, updates, and deletions in `sessionStorage`. When server products are fetched, `ProductContext` automatically merges local mutations: newly added products are prepended, edited properties override server fields, and deleted IDs are excluded. This ensures visual consistency across all pages during the user's current session.

### 3. Race Condition Protection with Axios AbortController
When typing rapidly in the search input or changing filter dropdowns, multiple network requests can be in flight simultaneously. If a slow older request finishes after a newer request, it could overwrite newer search results.
**Design Solution**: In `src/app/products/page.tsx`, an `AbortController` ref cancels pending HTTP requests before dispatching a new one. In `src/lib/axios.ts`, cancelled request errors (`axios.isCancel`) are silently ignored so no false error banners are rendered to the user.

### 4. URL Parameter Synchronization & Normalization
Dashboard state is stored directly in URL query parameters (`page`, `limit`, `search`, `category`, `sort`). The custom `useProductParams` hook normalizes input parameters safely (e.g. converting invalid numbers or negative pages back to `page=1` and `limit=20`), guaranteeing that deep-linked or bookmarked URLs load cleanly without crashing.

---

## 🤖 AI Usage Disclosure

This project was built with AI pair programming assistance from **Antigravity AI (Google DeepMind)**. 
- AI was used for architectural planning, drafting component boilerplate structures, setting up TypeScript interfaces, and refining accessible Tailwind CSS design tokens.
- All core business logic—including the shared Axios client interceptors, AbortController request cancellation, debouncing, URL state normalization, and local mutation merging—was explicitly designed, verified, and audited for production quality.
