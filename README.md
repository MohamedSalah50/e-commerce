# 🛒 E-Commerce REST API

A production-ready **E-Commerce Platform** REST API built with **NestJS** and **TypeScript**, featuring JWT authentication, AWS S3 media storage, Stripe payments, coupon system, cart management, and role-based access control.

---

## 🚀 Tech Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Framework      | NestJS (TypeScript)                    |
| Database       | MongoDB + Mongoose                     |
| Authentication | JWT (Access + Refresh Tokens)          |
| Cloud Storage  | AWS S3                                 |
| Payments       | Stripe (Checkout + Webhooks + Refunds) |
| Email          | Nodemailer + Event Emitter             |
| Architecture   | Generic Repository Pattern             |
| Caching        | Redis (RESP3)                          |
  
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat&logo=stripe&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_S3-FF9900?style=flat&logo=amazons3&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)

---

## 📁 Project Structure

```
src/
├── common/          # Enums, interfaces, decorators, guards, services
├── db/              # Mongoose models + generic repository pattern
├── modules/
│   ├── auth/        # Authentication
│   ├── user/        # User profile & wishlist
│   ├── brand/       # Brand management
│   ├── category/    # Category management
│   ├── product/     # Product listings & wishlist
│   ├── cart/        # Shopping cart
│   ├── coupon/      # Discount coupons
│   └── order/       # Orders + Stripe payments
└── utils/           # Security, email, multer, response helpers
```

---

## 🔐 Authentication APIs `POST /auth`

| Method | Endpoint                      | Description                 | Auth   |
| ------ | ----------------------------- | --------------------------- | ------ |
| POST   | `/auth/signup`                | Register new user           | Public |
| PATCH  | `/auth/confirm-email`         | Confirm email via OTP       | Public |
| POST   | `/auth/resend-confirm-email`  | Resend confirmation OTP     | Public |
| POST   | `/auth/login`                 | Login with email & password | Public |
| POST   | `/auth/send/forgot/password`  | Send forgot password OTP    | 🔒     |
| POST   | `/auth/reset/forgot/password` | Reset password via OTP      | 🔒     |

**Security features:**

- Hashed passwords with bcrypt
- OTP expiry (2 min confirm email, 3 min reset password)
- `changeCredentialsTime` invalidates old tokens instantly

---

## 👤 User APIs `/user`

| Method | Endpoint              | Description                | Auth          |
| ------ | --------------------- | -------------------------- | ------------- |
| GET    | `/user`               | Get profile with wishlist  | 🔒 User/Admin |
| PATCH  | `/user/profile-image` | Upload profile image to S3 | 🔒 User       |

---

## 🏷️ Brand APIs `/brand`

| Method | Endpoint                     | Description                               | Auth     |
| ------ | ---------------------------- | ----------------------------------------- | -------- |
| POST   | `/brand`                     | Create brand                              | 🔒 Admin |
| PATCH  | `/brand/:brandId`            | Update brand info                         | 🔒 Admin |
| PATCH  | `/brand/:brandId/attachment` | Update brand image (S3)                   | 🔒 Admin |
| GET    | `/brand`                     | Get all brands (with search & pagination) | Public   |
| GET    | `/brand/archived`            | Get all archived brands                   | 🔒 Admin |
| GET    | `/brand/:brandId`            | Get brand by ID                           | Public   |
| GET    | `/brand/:brandId/archived`   | Get archived brand by ID                  | Public   |
| DELETE | `/brand/:brandId/freeze`     | Freeze (soft delete) brand                | 🔒 Admin |
| PATCH  | `/brand/:brandId/restore`    | Restore frozen brand                      | 🔒 Admin |
| PATCH  | `/brand/:brandId/remove`     | Permanently delete brand                  | 🔒 Admin |

---

## 📂 Category APIs `/category`

| Method | Endpoint                           | Description                              | Auth     |
| ------ | ---------------------------------- | ---------------------------------------- | -------- |
| POST   | `/category`                        | Create category with brands              | 🔒 Admin |
| PATCH  | `/category/:CategoryId`            | Update category + add/remove brands      | 🔒 Admin |
| PATCH  | `/category/:CategoryId/attachment` | Update category image (S3)               | 🔒 Admin |
| GET    | `/category`                        | Get all categories (search & pagination) | Public   |
| GET    | `/category/archived`               | Get archived categories                  | 🔒 Admin |
| GET    | `/category/:CategoryId`            | Get category by ID                       | Public   |
| GET    | `/category/:CategoryId/archived`   | Get archived category by ID              | Public   |
| DELETE | `/category/:CategoryId/freeze`     | Freeze category                          | 🔒 Admin |
| PATCH  | `/category/:CategoryId/restore`    | Restore category                         | 🔒 Admin |
| PATCH  | `/category/:CategoryId/remove`     | Permanently delete category              | 🔒 Admin |

**Note:** Category update uses MongoDB `$setUnion` + `$setDifference` aggregation pipeline to add/remove brands atomically.

---

## 📦 Product APIs `/product`

| Method | Endpoint                                   | Description                                       | Auth     |
| ------ | ------------------------------------------ | ------------------------------------------------- | -------- |
| POST   | `/product`                                 | Create product                                    | 🔒 Admin |
| PATCH  | `/product/:productId`                      | Update product info + auto recalculate sale price | 🔒 Admin |
| PATCH  | `/product/:productId/attachments`          | Add/remove product images (S3, max 5)             | 🔒 Admin |
| GET    | `/product`                                 | Get all products (search & pagination)            | Public   |
| GET    | `/product/archived`                        | Get archived products                             | 🔒 Admin |
| GET    | `/product/:productId`                      | Get product by ID                                 | Public   |
| GET    | `/product/:productId/archived`             | Get archived product by ID                        | Public   |
| DELETE | `/product/:productId/freeze`               | Freeze product                                    | 🔒 Admin |
| PATCH  | `/product/:productId/restore`              | Restore product                                   | 🔒 Admin |
| PATCH  | `/product/:productId/remove`               | Permanently delete product                        | 🔒 Admin |
| PATCH  | `/product/:productId/add-to-wishlist`      | Add to user wishlist                              | 🔒 User  |
| PATCH  | `/product/:productId/remove-from-wishlist` | Remove from wishlist                              | 🔒 User  |

**Sale price** is auto-calculated: `originalPrice - (originalPrice × discountPercent / 100)`

---

## 🛒 Cart APIs `/cart`

| Method | Endpoint | Description                                 | Auth    |
| ------ | -------- | ------------------------------------------- | ------- |
| POST   | `/cart`  | Add product to cart (creates if not exists) | 🔒 User |
| PATCH  | `/cart`  | Remove products from cart                   | 🔒 User |
| DELETE | `/cart`  | Clear entire cart                           | 🔒 User |
| GET    | `/cart`  | Get cart with populated products            | 🔒 User |

---

## 🎟️ Coupon APIs `/coupon`

| Method | Endpoint      | Description                     | Auth     |
| ------ | ------------- | ------------------------------- | -------- |
| POST   | `/coupon`     | Create coupon with image upload | 🔒 Admin |
| GET    | `/coupon`     | Get all coupons                 | 🔒       |
| GET    | `/coupon/:id` | Get coupon by ID                | 🔒       |
| PATCH  | `/coupon/:id` | Update coupon                   | 🔒 Admin |
| DELETE | `/coupon/:id` | Delete coupon                   | 🔒 Admin |

**Coupon types:** percentage discount or fixed amount. Supports usage limit per user (`duration` field).

---

## 📋 Order APIs `/order`

| Method | Endpoint          | Description                                       | Auth    |
| ------ | ----------------- | ------------------------------------------------- | ------- |
| POST   | `/order`          | Create order from cart (cash or card)             | 🔒 User |
| POST   | `/order/:orderId` | Checkout — get Stripe payment session URL         | 🔒 User |
| PATCH  | `/order/:orderId` | Cancel order + auto restock + refund if paid      | 🔒 User |
| POST   | `/order/webhook`  | Stripe webhook — confirm payment & mark as placed | Public  |

**Order flow:**

1. User creates order → stock reserved, cart cleared
2. If card payment → hit checkout to get Stripe session URL
3. User pays → Stripe webhook confirms → order marked as `placed`
4. Cancel → stock restored, coupon usage reversed, Stripe refund if applicable

---

## ⚡ Caching (Redis)

Response caching is implemented using **Redis** with a custom interceptor + decorator pattern.

- `@TTL(seconds)` decorator — sets custom cache expiry per route (default: 10s)
- `RedisCacheInterceptor` — checks Redis before hitting the DB, caches the response after
- Applied on `GET /product` (findAll) with a 50s TTL

**Example:**
```typescript
@TTL(50)
@UseInterceptors(RedisCacheInterceptor)
@Get()
async findAll(@Query() query: GetAllDto) { ... }
```

Cache key format: `cache:{request.url}`

---

## 🗑️ Freeze / Restore / Remove Pattern

Brand, Category, and Product all follow a 3-state lifecycle:

```
Active → freeze() → Frozen → restore() → Active
                  → remove() → Permanently Deleted
```

- **freeze**: sets `freezedAt`, document hidden from public queries
- **restore**: removes `freezedAt`, document becomes active again
- **remove**: hard delete, only allowed when already frozen

---

## 🔒 Roles & Permissions

| Role    | Description            |
| ------- | ---------------------- |
| `user`  | Regular customer       |
| `admin` | Platform administrator |

---

## ⚙️ Environment Variables

```env
PORT=3000
MONGO_URI=mongodb://...
ACCESS_SECRET=
REFRESH_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EMAIL_USER=
EMAIL_PASS=
```

---

## 🏃 Running the App

```bash
# Clone the repository
git clone https://github.com/MohamedSalah50/e-commerce.git
cd e-commerce

# Install dependencies
npm install

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## 📌 Notes

- All list endpoints support `?page=1&size=10&search=keyword`
- Images stored on **AWS S3** — old images deleted automatically on update
- Stripe webhook validates payment before marking order as placed
- Generic `DatabaseRepository<T>` base class used across all repositories
- GET `/product` endpoint is cached via Redis (50s TTL) to reduce DB load


## 📬 Postman Collection

> Test all endpoints with the published collection:

[![Postman](https://img.shields.io/badge/Postman-Collection-FF6C37?style=flat&logo=postman&logoColor=white)](https://documenter.getpostman.com/view/42944447/2sBXwqqVsn)
