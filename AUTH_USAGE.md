# Centralized Authentication Usage Guide

## 📁 File Created
`lib/auth.ts` - Centralized authentication utilities

## 🚀 How to Use in Your Pages

### **Basic Usage (Replace existing auth logic):**

```typescript
// BEFORE (Old way - remove this)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function YourPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        // ... lots of duplicate code
      } catch (error) {
        router.push('/');
      }
    };
    checkUserAccess();
  }, []);
}

// AFTER (New way - use this)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserAccess, User } from '@/lib/auth';

export default function YourPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const authResult = await checkUserAccess();
        
        if (authResult.success && authResult.user) {
          setUser(authResult.user);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    authenticateUser();
  }, [router]);
}
```

### **For Admin Pages:**

```typescript
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export default function AdminPage() {
  const { authenticate } = useAuth('/dashboard', 'admin'); // Redirect to /dashboard if not admin

  useEffect(() => {
    authenticate();
  }, []);
  
  // Your page content here...
}
```

### **For Super Admin Pages:**

```typescript
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export default function SuperAdminPage() {
  const { authenticate } = useAuth('/dashboard', 'superadmin'); // Redirect to /dashboard if not superadmin

  useEffect(() => {
    authenticate();
  }, []);
  
  // Your page content here...
}
```

### **Using HOC (Higher-Order Component):**

```typescript
import { withAuth } from '@/lib/auth-components';

// Wrap your page component
const ProtectedPage = withAuth(YourPageComponent, {
  redirectTo: '/dashboard',
  requiredRole: 'admin'
});

export default ProtectedPage;
```

## 📋 Pages to Update

Replace the authentication logic in these files:

1. ✅ `app/dashboard/page.tsx` - DONE
2. ✅ `app/announcements/page.tsx` - DONE  
3. ⏳ `app/form/page.tsx` - TODO
4. ⏳ `app/courses/page.tsx` - TODO
5. ⏳ `app/admin/page.tsx` - TODO
6. ⏳ `app/admin/credits/page.tsx` - TODO
7. ⏳ `app/admin/courses/page.tsx` - TODO
8. ⏳ `app/admin/users/page.tsx` - TODO
9. ⏳ `app/policies/page.tsx` - TODO

## 🔧 Quick Update Steps for Each Page:

1. **Remove old imports:**
   ```typescript
   // Remove these
   import { isSuperAdminEmail } from '@/config/admin';
   // Remove your old User interface
   ```

2. **Add new imports:**
   ```typescript
   import { checkUserAccess, User } from '@/lib/auth';
   ```

3. **Replace authentication logic:**
   ```typescript
   // Replace your entire checkUserAccess function with:
   const authenticateUser = async () => {
     try {
       const authResult = await checkUserAccess();
       if (authResult.success && authResult.user) {
         setUser(authResult.user);
       } else {
         router.push('/'); // or appropriate redirect
       }
     } catch (error) {
       console.error('Authentication error:', error);
       router.push('/');
     } finally {
       setLoading(false);
     }
   };
   ```

4. **Update admin checks:**
   ```typescript
   // Replace
   const isAdmin = isSuperAdminEmail(user.email);
   
   // With
   const isAdmin = user.isSuperAdmin;
   ```

## 🎯 Benefits

- ✅ **Single source of truth** for authentication
- ✅ **No more duplicate code** across pages
- ✅ **Easy maintenance** - update once, affects all pages
- ✅ **TypeScript interfaces** included
- ✅ **Consistent error handling**
- ✅ **Reusable hooks** for different auth levels

## 📞 Need Help?

Just copy the pattern from the updated `dashboard/page.tsx` and `announcements/page.tsx` files!
