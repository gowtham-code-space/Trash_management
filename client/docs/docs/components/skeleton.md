# Skeleton Components

## Overview

Skeleton loaders provide visual placeholder states during data fetching, preventing layout shifts and improving perceived performance.

**Location**: `src/components/skeleton/`

## Available Components

### SkeletonLine

```javascript
<SkeletonLine width="100%" height="1rem" />
```

**Props**: `width`, `height`, `className`

### SkeletonBlock

```javascript
<SkeletonBlock width="200px" height="150px" rounded />
```

**Props**: `width`, `height`, `rounded` (boolean), `className`

### SkeletonCard

```javascript
<SkeletonCard count={5} />
```

Renders multiple skeleton cards for list views.

### SkeletonAvatar

```javascript
<SkeletonAvatar size={48} />
```

Circular skeleton for profile pictures.

### SkeletonButton

```javascript
<SkeletonButton width="120px" />
```

Button-shaped skeleton.

## Usage Example

```javascript
{isLoading ? (
  <SkeletonCard count={5} />
) : (
  <DataList data={items} />
)}
```

## Animation

CSS-based pulse animation:

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: #e5e7eb;
}
```

## Dark Theme Support

```javascript
<div className={isDarkTheme ? "dark:bg-gray-700" : "bg-gray-200"} />
```
