# Shared Components & Actions

This directory contains shared resources used across all feature modules in the admin dashboard.

## Directory Structure

```
_shared/
├── actions/
│   └── auth-actions.ts       # Authentication-related server actions
├── components/
│   └── AdminHeader.tsx        # Shared navigation header component
└── README.md                  # This file
```

## Purpose

The `_shared` directory follows Next.js conventions where directories starting with `_` are excluded from routing but can be imported by other modules. This keeps shared code organized and prevents accidental route creation.

## Components

### AdminHeader

**File:** `components/AdminHeader.tsx`

A responsive navigation header used across all admin pages via the layout.

**Features:**
- Desktop and mobile navigation
- Active route highlighting
- Role-based menu items (Users only visible to admins)
- User info display
- Logout functionality
- Dark mode support
- Mobile hamburger menu

**Props:**
```typescript
interface AdminHeaderProps {
  userName?: string
  userRole?: string
}
```

## Actions

### Auth Actions

**File:** `actions/auth-actions.ts`

Server actions for authentication operations.

**Exports:**
- `getCurrentUserAction()` - Fetches current user from session
- `logoutAction()` - Logs out user and redirects to login

## Usage

### Importing Components

```typescript
import { AdminHeader } from "@/app/(features)/_shared/components/AdminHeader"
```

### Importing Actions

```typescript
import { getCurrentUserAction, logoutAction } from "@/app/(features)/_shared/actions/auth-actions"
```

## Layout Integration

The shared components are automatically integrated via the features layout:

**File:** `app/(features)/layout.tsx`

```typescript
import { getCurrentUserAction } from "./_shared/actions/auth-actions"
import { AdminHeader } from "./_shared/components/AdminHeader"

export default async function FeaturesLayout({ children }) {
  const user = await getCurrentUserAction()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={user?.name} userRole={user?.role} />
      <main>{children}</main>
    </div>
  )
}
```

This means:
- ✅ All feature pages automatically get the header
- ✅ No need to import header in each page
- ✅ Consistent navigation across all modules
- ✅ Single source of truth for user data

## Adding New Shared Resources

### Adding Components

1. Create component in `_shared/components/`
2. Export from the component file
3. Import where needed using absolute path

### Adding Actions

1. Create action file in `_shared/actions/`
2. Mark with `"use server"` directive
3. Export functions
4. Import in components/pages as needed

## Best Practices

1. **Use `_shared` for truly shared code only**
   - Only put code here that's used by 2+ feature modules
   - Feature-specific code belongs in the feature directory

2. **Keep actions separate from components**
   - Server actions in `actions/`
   - Client/Server components in `components/`

3. **Use absolute imports**
   ```typescript
   // ✅ Good
   import { AdminHeader } from "@/app/(features)/_shared/components/AdminHeader"

   // ❌ Avoid
   import { AdminHeader } from "../_shared/components/AdminHeader"
   ```

4. **Document complex components**
   - Add JSDoc comments for props
   - Explain non-obvious behavior
   - Include usage examples

## Related Files

- `app/(features)/layout.tsx` - Main features layout using shared components
- `app/(features)/crm/page.tsx` - Example page using shared actions
