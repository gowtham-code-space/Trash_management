# Pagination Component

## Overview

Reusable pagination component supporting both client-side and server-side pagination modes.

**Location**: `src/utils/Pagination.jsx`

## Usage

### Server-Side Pagination

```javascript
<Pagination
  data={items}
  itemsPerPage={10}
  serverSide={true}
  totalItems={totalCount}
  currentPage={currentPage}
  onPageChange={(page) => setCurrentPage(page)}
  renderItem={(item) => <ItemCard item={item} />}
/>
```

### Client-Side Pagination

```javascript
<Pagination
  data={allItems}
  itemsPerPage={10}
  renderItem={(item) => <ItemCard item={item} />}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `array` | ✅ | Data array to paginate |
| `itemsPerPage` | `number` | ✅ | Items per page |
| `renderItem` | `function` | ✅ | Render function for each item |
| `serverSide` | `boolean` | ❌ | Enable server-side mode (default: false) |
| `totalItems` | `number` | ⚠️ | Total count (required if serverSide: true) |
| `currentPage` | `number` | ⚠️ | Current page (required if serverSide: true) |
| `onPageChange` | `function` | ⚠️ | Page change callback (required if serverSide: true) |

## Features

### Page Buttons

- Previous/Next arrows
- Page number buttons
- Current page highlighting

### Smart Display

- Shows max 5 page buttons
- Ellipsis for skipped pages
- Always shows first and last page

### Server-Side Flow

```
User clicks page 2
       ↓
onPageChange(2) triggered
       ↓
Parent component updates currentPage state
       ↓
useEffect dependency triggers API call
       ↓
New data fetched and set
       ↓
Pagination re-renders with new data
```

## Internal Logic

### Client-Side Slicing

```javascript
if (!serverSide) {
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  displayedData = data.slice(startIdx, endIdx);
}
```

### Server-Side Pass-Through

```javascript
if (serverSide) {
  displayedData = data;  // Already sliced by backend
}
```

## Styling

Tailwind CSS classes for buttons, active states, and hover effects.

```javascript
<button className={currentPage === page ? 'active-page-btn' : 'page-btn'}>
  {page}
</button>
```
