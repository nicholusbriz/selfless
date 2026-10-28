# Refresh Button Component - Usage Guide

## Overview

The `PageRefreshButton` component provides a manual refresh button that users can click to refresh data on any page. This replaces background polling with user-controlled data refreshing.

## Location

`app/dashboard/components/PageRefreshButton.tsx`

## Features

- ✅ Refreshes all active queries on the current page
- ✅ Shows loading state with spinning animation
- ✅ Two variants: `icon` (just the refresh icon) or `full` (icon + text)
- ✅ Optionally refresh specific queries by providing `queryKeys`
- ✅ Styled to match your existing design system

## Usage

### 1. Global Refresh (Already Added to TopNav)

The refresh button is already added to your TopNav component at the top of every dashboard page. Users can click it to refresh all data on the current page.

### 2. Page-Specific Refresh

Add the refresh button to individual pages if you want more control:

```tsx
import { PageRefreshButton } from '@/app/dashboard/components/PageRefreshButton';

export default function SomePage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Page Title</h1>
        <PageRefreshButton variant="full" />
      </div>
      {/* Rest of your page */}
    </div>
  );
}
```

### 3. Refresh Specific Queries

If you only want to refresh specific data:

```tsx
import { PageRefreshButton } from '@/app/dashboard/components/PageRefreshButton';

export default function EnglishHubPage() {
  return (
    <div>
      <PageRefreshButton
        queryKeys={[
          ['english-hub-registrations'],
          ['english-hub-status'],
        ]}
        variant="full"
      />
      {/* Rest of your page */}
    </div>
  );
}
```

### 4. Custom Styling

Add custom classes if needed:

```tsx
<PageRefreshButton
  variant="icon"
  className="ml-4"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `queryKeys` | `string[][]` | `undefined` | Specific query keys to refresh. If not provided, refreshes all active queries. |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'icon' \| 'full'` | `'icon'` | Display variant - icon only or icon with text |

## Benefits

1. **User Control**: Users decide when to refresh data
2. **Reduced API Calls**: No more background polling
3. **Better Performance**: Fewer unnecessary requests
4. **Clear Feedback**: Spinning animation shows when refreshing
5. **Flexible**: Can refresh all data or specific queries

## How It Works

When clicked, the button:
1. Shows loading state (spinning icon)
2. Calls `queryClient.refetchQueries()` to refresh data
3. React Query automatically refetches the specified queries
4. Loading state clears when refresh completes

## Example Use Cases

- **Dashboard**: Refresh social stats, tech center data
- **English Hub**: Refresh registration status
- **Admin Pages**: Refresh user lists, stats
- **Any Page**: Refresh all page data with one click

## Migration from Polling

If you have pages with `refetchInterval`, you can:

1. Remove `refetchInterval` from your `useQuery` calls
2. Add `PageRefreshButton` to the page
3. Users can now manually refresh when needed

### Before (with polling):
```tsx
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchInterval: 30 * 1000, // Polls every 30 seconds
});
```

### After (with manual refresh):
```tsx
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  // No refetchInterval - user controls refresh
});

// Add refresh button to your page
<PageRefreshButton queryKeys={[['data']]} variant="full" />
```

## Notes

- The button uses the same styling as your other nav icons
- Works with React Query's built-in caching
- Still refreshes on window focus (if `refetchOnWindowFocus` is enabled)
- Page navigation still triggers fresh data fetches
