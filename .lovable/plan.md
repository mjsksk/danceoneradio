
# Fix Admin Dashboard Access Issue

## Problem Diagnosis

The admin dashboard at `/admin` is redirecting to the homepage even for users with the admin role. This is caused by a **race condition** between the authentication context and the role-fetching hook.

### Root Cause
The `useUserRole` hook has a timing issue:
1. It initializes `loading: true` and `roles: []`
2. It waits for `user` from `AuthContext` before fetching roles
3. But if the `AdminRoute` component renders before `user` is available, the empty `roles` array causes a redirect to home
4. Even when `user` becomes available, the redirect has already happened

### Current Flow (Broken)
```text
+------------------+     +----------------+     +---------------+
| AuthContext      |     | useUserRole    |     | AdminRoute    |
| loading: true    |---->| loading: true  |---->| Show spinner  |
+------------------+     +----------------+     +---------------+
         |                       |                      |
         v                       v                      v
+------------------+     +----------------+     +---------------+
| loading: false   |     | roles: []      |     | No admin role |
| user: available  |     | (not fetched)  |     | REDIRECT HOME |
+------------------+     +----------------+     +---------------+
```

## Solution

Fix the `useUserRole` hook to properly wait for the auth context and ensure roles are fetched before the loading state is set to `false`.

### Changes Required

**1. Update `src/hooks/useUserRole.tsx`**
- Keep `loading: true` while `AuthContext.loading` is still true
- Add debug logging to help diagnose issues
- Ensure the hook only sets `loading: false` after a fetch attempt is complete

**2. Update `src/components/AdminRoute.tsx`**
- Add debug logging to understand the state when redirects happen
- Ensure redirects only occur after roles have been definitively checked

### Technical Implementation

**File: `src/hooks/useUserRole.tsx`**
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user';

interface UserRoleState {
  roles: AppRole[];
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
}

export function useUserRole(): UserRoleState {
  const { user, loading: authLoading } = useAuth();  // Also get authLoading
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      // Wait for auth to finish loading first
      if (authLoading) {
        return; // Don't set loading to false yet
      }

      if (!user) {
        setRoles([]);
        setRoleLoading(false);
        return;
      }

      try {
        console.log('Fetching roles for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          const fetchedRoles = (data || []).map(r => r.role as AppRole);
          console.log('Fetched roles:', fetchedRoles);
          setRoles(fetchedRoles);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setRoleLoading(false);
      }
    }

    fetchRoles();
  }, [user, authLoading]);  // Add authLoading as dependency

  // Only report as "done loading" when both auth is done AND roles are fetched
  const loading = authLoading || roleLoading;

  return {
    roles,
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('moderator'),
    loading
  };
}
```

**File: `src/components/AdminRoute.tsx`**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export function AdminRoute({ children, requiredRole = 'admin' }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole();

  // Debug logging
  console.log('AdminRoute state:', { 
    authLoading, 
    roleLoading, 
    user: user?.email, 
    roles 
  });

  // Show loading while checking auth and roles
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('AdminRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = roles.includes(requiredRole);
  
  if (!hasRequiredRole) {
    console.log('AdminRoute: User lacks required role, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute: Access granted');
  return <>{children}</>;
}
```

## Why This Fixes the Issue

1. **Proper dependency on `authLoading`**: The `useUserRole` hook now waits for `AuthContext` to finish loading before attempting to fetch roles
2. **Combined loading state**: The hook returns `loading: true` until BOTH auth is complete AND roles are fetched
3. **Debug logging**: Added console logs to help diagnose any future issues
4. **Clear flow**: The `AdminRoute` spinner stays visible until we definitively know the user's roles

## Testing Steps

1. Log out completely, then log in as `mario@danceoneradio.com`
2. Navigate to `/admin`
3. You should see the loading spinner briefly, then the admin dashboard
4. Check console logs for the role-fetching debug messages

## Bonus: Add Admin Link to Navigation

After fixing the access issue, we can add a visible "Admin" link to the navigation that only appears for admin users. This will make the dashboard discoverable without manually typing the URL.
