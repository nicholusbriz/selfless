# UI Components Usage Guide

## 🎯 Reusable Components Created

### **1. BackgroundImage Component**
**File:** `components/ui/BackgroundImage.tsx`

**Before (Duplicate Code):**
```typescript
// ❌ REPEATED 6+ TIMES
<div className="h-screen relative overflow-hidden">
  <div className="absolute inset-0 w-full h-full">
    <Image
      src="/atbriz.jpg"
      alt="Background"
      fill
      className="object-cover"
      style={{
        filter: 'brightness(0.3) contrast(1.1) saturate(0.8) blur(0.8px)',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
      priority
    />
  </div>
</div>
```

**After (Reusable Component):**
```typescript
// ✅ SIMPLE USAGE
import { BackgroundImage } from '@/components/ui';

<BackgroundImage>
  <div>Your content here</div>
</BackgroundImage>

// OR with custom props
<BackgroundImage 
  className="min-h-screen relative overflow-hidden"
  priority={false}
>
  <div>Your content here</div>
</BackgroundImage>
```

---

### **2. LoadingSpinner Component**
**File:** `components/ui/LoadingSpinner.tsx`

**Before (Duplicate Code):**
```typescript
// ❌ REPEATED 5+ TIMES
<div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-white mx-auto mb-6"></div>
<p className="text-orange-200 text-xl font-medium animate-pulse">Loading...</p>
```

**After (Reusable Component):**
```typescript
// ✅ SIMPLE USAGE
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner />

// OR with custom props
<LoadingSpinner 
  size="lg"
  color="orange"
  showText={true}
  text="Loading your data..."
/>
```

**Available Props:**
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'white' | 'orange' | 'emerald' | 'cyan' | 'purple'
- `showText`: boolean
- `text`: string

---

### **3. BackgroundGradient Component**
**File:** `components/ui/BackgroundGradient.tsx`

**Before (Duplicate Code):**
```typescript
// ❌ REPEATED 3+ TIMES
<div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
</div>
```

**After (Reusable Component):**
```typescript
// ✅ SIMPLE USAGE
import { BackgroundGradient } from '@/components/ui';

<BackgroundGradient>
  <div>Your content here</div>
</BackgroundGradient>

// OR with custom props
<BackgroundGradient 
  className="min-h-screen"
  showGrid={false}
>
  <div>Your content here</div>
</BackgroundGradient>
```

---

### **4. LoadingButton Component**
**File:** `components/ui/LoadingButton.tsx`

**Before (Duplicate Code):**
```typescript
// ❌ REPEATED 3+ TIMES
{isLoading ? (
  <span className="flex items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
    Loading...
  </span>
) : (
  <span>Submit</span>
)}
```

**After (Reusable Component):**
```typescript
// ✅ SIMPLE USAGE
import { LoadingButton } from '@/components/ui';

<LoadingButton 
  isLoading={loading}
  loadingText="Submitting..."
  className="w-full bg-blue-600 text-white py-2 px-4 rounded"
>
  Submit Form
</LoadingButton>
```

---

### **5. PageLoader Component**
**File:** `components/ui/PageLoader.tsx`

**Before (Duplicate Code):**
```typescript
// ❌ REPEATED 3+ TIMES
<div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
  <div className="text-center relative z-10">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-white mx-auto mb-6"></div>
    <p className="text-orange-200 text-xl font-medium animate-pulse">Loading...</p>
  </div>
</div>
```

**After (Reusable Component):**
```typescript
// ✅ SIMPLE USAGE
import { PageLoader } from '@/components/ui';

<PageLoader 
  text="Authenticating..."
  color="purple"
/>
```

---

## 📋 Pages to Update

Replace the duplicate code in these files:

### **1. Login Page** (`app/login/page.tsx`)
- Replace background image with `<BackgroundImage>`
- Replace loading spinner with `<LoadingSpinner>`
- Replace button loading with `<LoadingButton>`

### **2. Register Page** (`app/register/page.tsx`)
- Replace background image with `<BackgroundImage>`
- Replace loading spinner with `<LoadingSpinner>`

### **3. Form Page** (`app/form/page.tsx`)
- Replace loading sections with `<PageLoader>`
- Replace button loading with `<LoadingButton>`

### **4. Courses Page** (`app/courses/page.tsx`)
- Replace loading sections with `<PageLoader>`
- Replace button loading with `<LoadingButton>`

### **5. Announcements Page** (`app/announcements/page.tsx`)
- Replace background image with `<BackgroundImage>`
- Replace loading sections with `<PageLoader>`

### **6. Admin Pages**
- Replace background gradients with `<BackgroundGradient>`
- Replace loading sections with `<PageLoader>`

---

## 🚀 Import All Components

```typescript
// Import all UI components at once
import { 
  BackgroundImage, 
  LoadingSpinner, 
  BackgroundGradient, 
  LoadingButton, 
  PageLoader 
} from '@/components/ui';
```

---

## 📊 Code Reduction Summary

**Before:** ~200+ lines of duplicate code across pages
**After:** ~50 lines of reusable components
**Reduction:** ~75% less code!

**Benefits:**
- ✅ **Single source of truth** for UI patterns
- ✅ **Consistent styling** across all pages
- ✅ **Easy maintenance** - update once, works everywhere
- ✅ **TypeScript interfaces** included
- ✅ **Flexible customization** with props

**Your UI is now centralized and maintainable!** 🎉
