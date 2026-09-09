# ROOVEKA Project Status Document
**Last Updated**: 08 Sep 2026, 07:48 PM IST  
**Project Path**: `c:\Users\naren\OneDrive\Documents\rooveka-web2`

---

## 1. Project Overview

**ROOVEKA** is a premium Indian bean-to-bar artisan chocolate brand based in **Andhra Pradesh, India**.

This project is a **full-stack e-commerce platform** built from scratch, consisting of:
- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 (Vite 8)
- **Backend**: Node.js + Express.js REST API
- **Database**: MySQL (`rooveka_db`)
- **Admin Panel**: Built-in full management dashboard

The platform covers the **complete customer purchasing journey** — from browsing chocolate products to placing an order — and gives the **store owner** a full Admin Dashboard for sales analytics, order fulfillment, and live price management.

---

## 2. Current Status Summary

| Component | Status |
| :--- | :---: |
| Frontend Storefront (React) | ✅ Complete |
| Tailwind CSS Brand Design System | ✅ Complete |
| Product Catalog (3 Products) | ✅ Complete |
| Product Customization Modal | ✅ Complete |
| Cart Drawer + Checkout Modal | ✅ Complete |
| Admin Dashboard (Analytics, Orders, Pricing) | ✅ Complete |
| Central Pricing Config File | ✅ Complete |
| Node.js + Express REST API Server | ✅ Complete |
| MySQL Database Connection & Schema | ✅ Complete |
| Frontend ↔ Backend API Integration | ✅ Complete |
| MySQL Database Seeding (Products + Sample Orders) | ✅ Complete |
| Production Build (`npm run build`) | ✅ Verified (0 errors) |
| Backend Server Last Startup | ✅ Connected to `rooveka_db` |

---

## 3. Technology Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Frontend Framework | React | ^19.2.8 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | ^8.2.2 |
| CSS Framework | Tailwind CSS | ^4.3.3 |
| PostCSS Plugin | @tailwindcss/postcss | ^4.3.3 |
| Icons | Lucide React | ^1.42.0 |
| Heading Font | Playfair Display | Google Fonts |
| Body Font | Plus Jakarta Sans | Google Fonts |
| Backend Runtime | Node.js | v22.16.0 |
| Backend Framework | Express.js | ^4.19.2 |
| MySQL Driver | mysql2 | ^3.9.7 |
| Environment Config | dotenv | ^16.4.5 |
| CORS Handler | cors | ^2.8.5 |
| Local MySQL | MySQL 8.x | Installed on PC |

---

## 4. Complete File Architecture

```
rooveka-web2/
│
├── index.html                         ← HTML entry: fonts, SEO meta tags, root div
├── package.json                       ← Frontend dependencies & npm scripts
├── tsconfig.json                      ← TypeScript compiler options (jsx: react-jsx)
├── tailwind.config.js                 ← Custom brand tokens (colors, fonts, keyframes)
├── postcss.config.js                  ← PostCSS with @tailwindcss/postcss plugin
│
├── dist/                              ← Production build output (after npm run build)
│
├── src/                               ← All Frontend React source code
│   ├── main.tsx                       ← React DOM mount point
│   ├── App.tsx                        ← Master component: assembles all sections
│   ├── index.css                      ← Tailwind @import, @theme variables, animations
│   ├── vite-env.d.ts                  ← Vite TypeScript client type declarations
│   │
│   ├── config/
│   │   └── pricing.ts                 ← ⭐ CENTRAL PRICING CONFIG (edit prices here)
│   │
│   ├── types/
│   │   └── index.ts                   ← TypeScript interfaces: Product, CartItem, OrderRecord, OrderStatus
│   │
│   ├── data/
│   │   ├── products.ts                ← Static definitions for 3 ROOVEKA products
│   │   └── sampleOrders.ts            ← Initial sample orders for Admin Dashboard seeding
│   │
│   ├── context/
│   │   └── CartContext.tsx            ← Global state: cart, orders, pricing, modals + MySQL API sync
│   │
│   └── components/
│       ├── Header.tsx                 ← Sticky navbar: logo, nav links, search, cart, ADMIN button
│       ├── Hero.tsx                   ← Cinematic hero: headline, CTAs, trust metrics, product card
│       ├── BrandIntro.tsx             ← "The ROOVEKA Way" editorial split section
│       ├── ProductCatalog.tsx         ← 3-column product grid (uses dynamic products from context)
│       ├── ProductCard.tsx            ← Individual product card: image, name, description, CTA
│       ├── ProductImageGraphic.tsx    ← SVG/CSS vector product visuals for all 3 products
│       ├── ProductModal.tsx           ← Centered customization modal: size, qty, add to cart
│       ├── HotChocolateFeature.tsx    ← Hot Chocolate feature + 4-step "How to Make" guide
│       ├── BeanToBarProcess.tsx       ← 8-stage craft journey (COCOA BEANS → BAR)
│       ├── AndhraStory.tsx            ← Origin story: Andhra Pradesh terroir & coordinates
│       ├── QualityPillars.tsx         ← 4 trust pillars: Single Origin, Small Batch, Pure, B2B
│       ├── IngredientPhilosophy.tsx   ← "Nothing to Hide" section with ingredient pills
│       ├── FounderStory.tsx           ← Artisan story: personal human-focused editorial card
│       ├── CartDrawer.tsx             ← Right slide-out cart: items, qty, free shipping bar, checkout
│       ├── CheckoutModal.tsx          ← Checkout form + payment selection + order confirmation + MySQL save
│       ├── AdminDashboard.tsx         ← Full Admin Panel: Analytics | Orders | Pricing tabs
│       ├── SearchModal.tsx            ← Instant product search overlay (uses context products)
│       ├── ContactModal.tsx           ← Contact inquiry form with confirmation state
│       ├── WhatsAppButton.tsx         ← Floating WhatsApp quick-chat button (bottom-right)
│       ├── ToastNotification.tsx      ← Bottom-left cart/action feedback notifications
│       └── Footer.tsx                 ← Dark cocoa footer: links, newsletter, Admin link
│
└── server/                            ← Node.js + Express.js MySQL Backend
    ├── .env                           ← ⭐ Database credentials (do NOT commit to git)
    ├── package.json                   ← Backend dependencies
    ├── db.js                          ← MySQL connection pool + testConnection()
    ├── schema.js                      ← Table creation + initial product & order seeding
    └── index.js                       ← Main Express API server with all REST endpoints
```

---

## 5. MySQL Database Details

**Database Name**: `rooveka_db`  
**Username**: `rooveka_admin`  
**Host**: `localhost:3306`

### Tables Created

| Table | Purpose |
| :--- | :--- |
| `products` | Store product info (id, name, category, description, image_tag) |
| `product_sizes` | Store size variants and prices (50g=₹345, 100g=₹595, etc.) |
| `orders` | Customer order records (customer info, total, status, timestamp) |
| `order_items` | Individual items within each order (product, size, qty, price) |
| `settings` | Store configuration (free shipping threshold, shipping fee, currency) |

### Default Settings Seeded

| Key | Value |
| :--- | :--- |
| `free_shipping_threshold` | `999` |
| `flat_shipping_fee` | `99` |
| `currency_symbol` | `₹` |

---

## 6. REST API Endpoints (Express Server — Port 5000)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/products` | Fetch all 3 products with live MySQL prices |
| `PUT` | `/api/products/:id/price` | Update price for a product size variant |
| `GET` | `/api/orders` | Fetch all orders with item details |
| `POST` | `/api/orders` | Create a new customer order (from checkout) |
| `PATCH` | `/api/orders/:id/status` | Update order status (Pending → Dispatched → Delivered) |
| `GET` | `/api/settings` | Fetch store settings (shipping threshold etc.) |
| `PUT` | `/api/settings/shipping-threshold` | Update free shipping threshold |

---

## 7. Central Pricing Configuration

**File**: [`src/config/pricing.ts`](file:///c:/Users/naren/OneDrive/Documents/rooveka-web2/src/config/pricing.ts)

This is the **single place to update all product prices** without touching any component code:

```ts
productPrices: {
  'rooveka-70-dark':       { '50g': 345,  '100g': 595  },
  'rooveka-50-dark':       { '50g': 325,  '100g': 565  },
  'rooveka-hot-chocolate': { '150g': 395, '300g': 695  },
}
```

Price changes in this file = automatic updates everywhere on the storefront.  
Prices can also be updated **live via the Admin Dashboard → Pricing Tab** (syncs to MySQL).

---

## 8. Admin Dashboard Features

**Access**: Click `ADMIN` button in Header (desktop) or Mobile Menu → "OPEN ADMIN DASHBOARD"  
**Also accessible from**: Footer → "Admin Dashboard" link

### Tab 1: Overview & Sales Analytics
- Total Sales Revenue (₹) from non-cancelled orders
- Total Orders count, Pending count, Dispatched count
- Average Order Value (AOV)
- Delivered Orders count
- Product Performance Summary (all 3 products with prices)
- Recent Activity feed (last 4 orders)

### Tab 2: Orders Management
- Filterable order table (All / Pending / Dispatched / Delivered / Cancelled)
- Live search by Order ID, Customer Name, Phone, or City
- Full order details: ID, timestamp, address, items, payment method, total
- Status update buttons: `MARK DISPATCHED`, `MARK DELIVERED`, `CANCEL ORDER`
- **New orders placed by customers appear here automatically in real-time**

### Tab 3: Pricing & Catalog Settings
- Live price editor for each product size variant
- One-click `SAVE` button per size — updates MySQL and storefront instantly
- Free Shipping Threshold editor — change the ₹999 minimum with `UPDATE` button

---

## 9. Customer Storefront Sections (Top → Bottom)

1. **Header** — Sticky, compresses on scroll, ROOVEKA logo, nav links, search icon, cart icon, ADMIN button
2. **Hero** — Eyebrow badge, headline, subheading, dual CTAs (`SHOP CHOCOLATE` / `OUR STORY`), trust metrics, product visual card
3. **Brand Introduction** — "THE ROOVEKA WAY" editorial split layout
4. **Product Catalog** (`#shop`) — 3-column grid with ProductCards (image, name, description, price, `CHOOSE OPTIONS →`)
5. **Hot Chocolate Feature** (`#hot-chocolate`) — Product intro, 4-step How to Make guide (HEAT → ADD → STIR → ENJOY)
6. **Bean to Bar Process** (`#bean-to-bar`) — 8-stage grid (COCOA BEANS → SORT → ROAST → GRIND → CONCH → TEMPER → MOULD → BAR)
7. **Andhra Pradesh Story** — Origin narrative + coordinates 16°30'N, 80°38'E
8. **Quality Pillars** — 4 horizontal trust icons
9. **Ingredient Philosophy** — "Nothing to Hide" + ingredient pills (COCOA · SUGAR · COCOA BUTTER)
10. **Founder Story** — "Made by People Who Care About Chocolate" dark card
11. **Footer** — Deep cocoa footer, navigation, policies, newsletter, copyright

### Overlays / Modals
- **Product Customization Modal** — size selector, quantity, live price, add to cart
- **Cart Drawer** — slide from right, items, qty controls, free shipping bar, checkout trigger
- **Checkout Modal** — address form, payment (UPI/Card/COD), order confirmation with ROOV-XXXXXX ID
- **Search Overlay** — instant product filter
- **Contact Modal** — inquiry form with confirmation
- **Admin Dashboard** — full-screen management panel

---

## 10. Data Flow Architecture

```
Customer Action
     ↓
React Component (e.g. ProductModal, CheckoutModal)
     ↓
CartContext (useCart hook)
     ↓
┌─────────────────────┬──────────────────────────┐
│  LocalStorage       │  MySQL Express API        │
│  (Immediate, Sync)  │  (http://localhost:5000)  │
│  Cart items         │  POST /api/orders         │
│  Orders             │  PATCH /api/orders/:id    │
│  Pricing config     │  PUT /api/products/:id    │
└─────────────────────┴──────────────────────────┘

Note: Fallback to LocalStorage if API is offline (graceful degradation)
```

---

## 11. How to Start the Application

### Start Backend (MySQL API Server)
```bash
# Terminal 1 — from project root
cd server
npm start
# ✅ Should print: "Connected successfully to MySQL Database: rooveka_db"
# ✅ Should print: "ROOVEKA Express MySQL Server running on http://localhost:5000"
```

### Start Frontend Dev Server
```bash
# Terminal 2 — from project root
npm run dev
# Opens at: http://localhost:5173/
```

### Build for Production
```bash
npm run build
# Output in: dist/
# Last verified build: ✅ built in 2.25s, 0 errors
```

---

## 12. Known Issues & Limitations

| Issue | Severity | Notes |
| :--- | :--- | :--- |
| **No authentication on Admin Dashboard** | 🔴 High | Admin panel is accessible without any login/password. Anyone who knows the URL can open it. |
| **MySQL credentials in plain .env file** | 🟡 Medium | `.env` file should NOT be committed to git. A `.gitignore` entry should be confirmed. |
| **No real payment gateway** | 🟡 Medium | UPI/Card/COD payment methods are simulated UI only. No actual payment processing. |
| **CORS is fully open** | 🟡 Medium | `app.use(cors())` allows all origins. Should be restricted to frontend URL in production. |
| **Product images are CSS graphics** | 🟢 Low | Product photography is CSS/SVG vector representations. Actual product photos not yet uploaded. |
| **No order email notifications** | 🟢 Low | No email/SMS sent to customer or admin when order is placed. |
| **No pagination on orders table** | 🟢 Low | Orders table will grow long as orders accumulate. No pagination implemented yet. |
| **`tailwind.config.js` not active in Tailwind v4** | 🟢 Low | Tailwind v4 uses `@theme` in CSS directly. The `tailwind.config.js` is legacy and not used. |

---

## 13. Design Decisions Made

| Decision | Rationale |
| :--- | :--- |
| React Context API (not Redux) | Sufficient for this scale; avoids heavy boilerplate |
| Tailwind CSS v4 `@theme` in CSS | v4 moved from JS config to CSS-first theming |
| CSS/SVG product graphics | Allows placeholder visuals without requiring real photos upfront |
| Graceful API fallback to localStorage | App works even when MySQL server is not running |
| Separate `server/` directory | Clean separation of frontend and backend code |
| `type: "module"` in server package.json | Enables ES Module `import` syntax in Node.js |
| No routing library (React Router) | Single-page scroll site; no multi-page navigation needed |
| LocalStorage persistence | Cart survives browser refreshes without a user login system |

---

## 14. Pending / Next Steps

### High Priority
- [ ] **Admin Login & Password Protection** — Add a simple password gate before accessing Admin Dashboard (JWT or session-based)
- [ ] **Upload Real Product Photography** — Replace CSS graphics in `ProductImageGraphic.tsx` with actual ROOVEKA product photos
- [ ] **WhatsApp Phone Number** — Replace placeholder `919876543210` in `WhatsAppButton.tsx` with actual ROOVEKA WhatsApp number

### Medium Priority
- [ ] **Razorpay / PhonePe Payment Gateway** — Integrate actual Indian UPI payment processing in `CheckoutModal.tsx`
- [ ] **Order Email Notifications** — Send order confirmation email to customer and alert email to admin (using Nodemailer or Resend)
- [ ] **Order Pagination** — Add page-based or infinite scroll pagination to Admin Orders table
- [ ] **CORS Restriction** — Limit CORS in `server/index.js` to only the frontend URL
- [ ] **Rate Limiting** — Add `express-rate-limit` to prevent API abuse

### Low Priority / Polish
- [ ] **`src/config/pricing.ts` → MySQL settings** — Currently seeded once on startup; ensure runtime pricing reads always come from MySQL
- [ ] **Remove `tailwind.config.js`** — It is unused in Tailwind v4 (all tokens are in `index.css` `@theme`)
- [ ] **Add `.gitignore` for `server/.env`** — Confirm `server/.env` is not tracked by git
- [ ] **Analytics Charts** — Add visual bar/line charts to Admin Dashboard Analytics tab
- [ ] **Shipping Address Validation** — Add pincode-based state auto-detection in checkout form
- [ ] **SEO Optimization** — Add Open Graph tags, Twitter Cards, product schema markup

---

## 15. Environment & Credentials Reference

> [!CAUTION]
> Never share or commit these credentials to a public repository.

| Item | Value |
| :--- | :--- |
| MySQL Database | `rooveka_db` |
| MySQL Username | `rooveka_admin` |
| MySQL Password | `Rooveka@SecurePass123` |
| MySQL Host | `localhost:3306` |
| Backend API URL | `http://localhost:5000/api` |
| Frontend Dev URL | `http://localhost:5173/` |
| Frontend Preview URL | `http://localhost:3000/` |
| Backend Config File | `server/.env` |
| Frontend API Config | `src/context/CartContext.tsx` (line 7: `API_BASE_URL`) |
