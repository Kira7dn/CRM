# Authentication & Authorization Module

## Overview

This module implements a complete authentication and authorization system for the Hải sản Ngày Mới Admin Dashboard using Clean/Onion Architecture.

## Features

- ✅ **User Authentication** (Login/Logout)
- ✅ **Role-Based Access Control (RBAC)** (admin, sale, warehouse)
- ✅ **Password Security** (bcrypt hashing with salt rounds = 10)
- ✅ **Session Management** (HTTP-only cookies)
- ✅ **Route Protection** (Middleware)
- ✅ **User Management** (CRUD operations - admin only)
- ✅ **Password Validation** (8+ chars, uppercase, lowercase, number)
- ✅ **Email Validation**

## Architecture

### Domain Layer
- **[core/domain/admin-user.ts](core/domain/admin-user.ts)**: AdminUser entity, validation, and permission utilities

### Application Layer
- **Interfaces**: [core/application/interfaces/admin-user-service.ts](core/application/interfaces/admin-user-service.ts)
- **Use Cases**:
  - [LoginUseCase](core/application/usecases/admin-user/login.ts)
  - [RegisterAdminUserUseCase](core/application/usecases/admin-user/register.ts)
  - [GetCurrentUserUseCase](core/application/usecases/admin-user/get-current-user.ts)
  - [ChangePasswordUseCase](core/application/usecases/admin-user/change-password.ts)
  - [GetAllUsersUseCase](core/application/usecases/admin-user/get-all-users.ts)
  - [UpdateAdminUserUseCase](core/application/usecases/admin-user/update-user.ts)
  - [DeleteAdminUserUseCase](core/application/usecases/admin-user/delete-user.ts)

### Infrastructure Layer
- **Repository**: [AdminUserRepository](infrastructure/repositories/admin-user-repo.ts) (extends BaseRepository)
- **Database**: MongoDB collection `admin_users`

### API Layer
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/logout` - Logout
- **GET** `/api/auth/me` - Get current user
- **POST** `/api/auth/register` - Register new user (admin only)
- **POST** `/api/auth/change-password` - Change password
- **GET** `/api/auth/users` - Get all users (admin only)
- **PATCH** `/api/auth/users/[id]` - Update user (admin only)
- **DELETE** `/api/auth/users/[id]` - Delete user (admin only)

### UI Layer
- **[/admin/login](app/(features)/admin/login/page.tsx)** - Login page
- **[/admin/dashboard](app/(features)/admin/dashboard/page.tsx)** - Dashboard (protected)
- **[/admin/users](app/(features)/admin/users/page.tsx)** - User management (admin only)

## User Roles & Permissions

| Module         | Admin | Sale       | Warehouse  |
| -------------- | ----- | ---------- | ---------- |
| **Dashboard**  | Full  | Read       | Read       |
| **Products**   | Full  | Read       | Read/Write (stock) |
| **Categories** | Full  | Read       | No         |
| **Orders**     | Full  | Read/Write | Read/Write (status) |
| **Customers**  | Full  | Read       | No         |
| **Banners**    | Full  | Read       | No         |
| **Posts**      | Full  | Read       | No         |
| **Stations**   | Full  | Read       | No         |
| **Users**      | Full  | No         | No         |
| **Campaigns**  | Full  | Read       | No         |

## Getting Started

### 1. Install Dependencies

```bash
npm install bcryptjs @types/bcryptjs
npm install -D tsx
```

### 2. Seed First Admin User

```bash
npm run seed-admin
```

Or alternatively:
```bash
npx tsx --env-file=.env.local scripts/seed-admin.ts
```

This creates an admin user with:
- **Email**: admin@haisanngaymoi.com
- **Password**: Admin@123456 (⚠️ CHANGE THIS IMMEDIATELY)
- **Role**: admin

### 3. Login

Navigate to: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

## Session Management

- Sessions are stored in HTTP-only cookies
- Cookie lifetime: 7 days
- Cookies: `admin_user_id`, `admin_user_role`
- Secure flag enabled in production

## Route Protection

The [middleware.ts](middleware.ts) automatically protects these routes:

- `/admin/dashboard` - All authenticated users
- `/admin/users` - Admin only
- `/admin/profile` - All authenticated users
- `/admin/products` - All authenticated users
- `/admin/orders` - All authenticated users
- `/admin/customers` - All authenticated users
- `/admin/banners` - All authenticated users
- `/admin/stations` - All authenticated users
- `/admin/posts` - All authenticated users
- `/admin/campaigns` - All authenticated users

Unauthenticated users are redirected to `/admin/login`.

## API Authentication

All protected API endpoints check for session cookies:

```typescript
const cookieStore = await cookies()
const userId = cookieStore.get("admin_user_id")?.value
const userRole = cookieStore.get("admin_user_role")?.value

if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

if (userRole !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

## Security Features

### 1. Password Hashing
- Uses bcrypt with salt rounds = 10
- Passwords never stored in plain text
- Password hashes excluded from API responses

### 2. Input Validation
- Email format validation
- Password strength validation
- Role and status validation
- Phone number format validation (Vietnamese)

### 3. CSRF Protection
- Next.js built-in CSRF protection
- HTTP-only cookies
- SameSite cookie attribute

### 4. Rate Limiting
- **TODO**: Implement rate limiting on login endpoint
- Suggested: Max 5 attempts per minute per IP

### 5. Secure Cookies
```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/"
}
```

## User Management

### Create User (Admin Only)

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "sale", // admin | sale | warehouse
  "phone": "0912345678" // optional
}
```

### Update User (Admin Only)

```typescript
PATCH /api/auth/users/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "warehouse",
  "status": "inactive" // active | inactive
}
```

### Delete User (Admin Only)

```typescript
DELETE /api/auth/users/{id}
```

**Note**: Cannot delete the last active admin user.

## Change Password

```typescript
POST /api/auth/change-password
Content-Type: application/json

{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

## Permission Checking

Use the `Permissions` utility from domain:

```typescript
import { Permissions } from "@/core/domain/admin-user"

if (Permissions.canManageUsers(userRole)) {
  // Allow user management
}

if (Permissions.canViewOrders(userRole)) {
  // Allow viewing orders
}

if (Permissions.canUpdateOrderStatus(userRole)) {
  // Allow updating order status
}
```

## Database Schema

**Collection**: `admin_users`

```typescript
{
  _id: ObjectId,              // MongoDB ID
  email: string,              // Unique, lowercase
  passwordHash: string,       // bcrypt hash
  name: string,
  role: "admin" | "sale" | "warehouse",
  status: "active" | "inactive",
  phone?: string,
  avatar?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Domain Tests
```bash
npm test core/domain/__tests__/admin-user.spec.ts
```

### Use Case Tests
```bash
npm test core/application/usecases/admin-user/__tests__/
```

### Integration Tests
```bash
npm test infrastructure/repositories/__tests__/admin-user-repo.spec.ts
```

## TODO / Future Improvements

- [ ] Implement rate limiting on login endpoint
- [ ] Add password reset via email
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add activity logging (audit trail)
- [ ] Implement refresh tokens
- [ ] Add "Remember Me" functionality
- [ ] Email verification for new users
- [ ] Account lockout after failed login attempts
- [ ] Password expiration policy
- [ ] OAuth integration (Google, Facebook)

## Troubleshooting

### "Email already exists" error
- Check if user already registered
- Use different email address

### "Invalid email or password"
- Verify credentials
- Check user status (must be "active")
- Reset password if needed

### "Only admins can..." error
- Verify your role in `/admin/dashboard`
- Contact an admin to change your role

### Session expired / Auto logout
- Sessions expire after 7 days
- Login again at `/admin/login`

## Security Best Practices

1. ✅ Never commit `.env` files with real credentials
2. ✅ Change default admin password immediately
3. ✅ Use strong passwords (8+ chars, mixed case, numbers)
4. ✅ Regularly review user list and remove inactive users
5. ✅ Enable HTTPS in production
6. ⚠️ TODO: Enable rate limiting
7. ⚠️ TODO: Implement password reset via email
8. ⚠️ TODO: Add activity logging

## Support

For issues or questions:
- Check [PRD/Admin.md](PRD/Admin.md) for requirements
- Check [CLAUDE.md](CLAUDE.md) for architecture guidelines
- Review use case tests for examples

---

**Version**: 1.0
**Last Updated**: 2025-11-17
**Status**: ✅ Production Ready (with TODOs)
