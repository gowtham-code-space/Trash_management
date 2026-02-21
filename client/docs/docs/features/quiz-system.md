# Quiz System

## Overview

The quiz feature provides an educational assessment system for all user types. Users can take environmental waste management quizzes and view their historical performance with certificate generation capabilities.

## Entry Points

| Role | Route | Component |
|------|-------|-----------|
| All Roles | `/quiz` | `Quiz.jsx` |
| All Roles | `/take-quiz` | `TakeQuiz.jsx` |

## Components

### Quiz.jsx

**Location**: `src/pages/Common/Quiz/Quiz.jsx`

**Purpose**: Quiz history dashboard with statistics and certificates

#### UI Sections

1. **Statistics Cards**: Display quiz performance metrics
2. **Recent Quiz History**: Paginated list of past quiz attempts
3. **Certificates**: Downloadable achievement certificates

#### Key Features

**Date Filtering**:
```javascript
const [dateFilter, setDateFilter] = useState('all');
const [customStartDate, setCustomStartDate] = useState(null);
const [customEndDate, setCustomEndDate] = useState(null);
```

Supported filters:
- All (default)
- Today
- This Week
- This Month
- Custom Range (DateRangePicker modal)

**Server-Side Pagination**:
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const itemsPerPage = 5;

<Pagination
  data={quizHistory}  
  itemsPerPage={itemsPerPage}
  serverSide={true}
  totalItems={totalItems}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  renderItem={(quiz) => <QuizCard quiz={quiz} />}
/>
```

**Loading States**:
```javascript
{isLoadingHistory ? (
  <SkeletonCard count={5} />
) : quizHistory.length === 0 ? (
  <div>
    <Task size={48} />
    <p>No Quiz record found</p>
  </div>
) : (
  <Pagination ... />
)}
```

#### Date Filter Implementation

**Today Filter**:
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const startDate = formatUTCDateTime(today);
const endDate = formatUTCDateTime(tomorrow);
```

**This Week Filter**:
```javascript
const today = new Date();
const dayOfWeek = today.getDay();
const monday = new Date(today);
monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
monday.setHours(0, 0, 0, 0);

const nextMonday = new Date(monday);
nextMonday.setDate(monday.getDate() + 7);
```

**This Month Filter**:
```javascript
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
firstDay.setHours(0, 0, 0, 0);

const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
nextMonth.setHours(0, 0, 0, 0);
```

**UTC Conversion**:
```javascript
function formatUTCDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
```

#### Data Fetching

```javascript
useEffect(() => {
  fetchQuizHistory();
}, [dateFilter, customStartDate, customEndDate, currentPage]);

async function fetchQuizHistory() {
  setIsLoadingHistory(true);
  
  try {
    let startDate = null;
    let endDate = null;
    
    if (dateFilter === 'today') {
      // Calculate today's date range
    } else if (dateFilter === 'week') {
      // Calculate week range
    } else if (dateFilter === 'month') {
      // Calculate month range
    } else if (dateFilter === 'custom') {
      startDate = formatUTCDateTime(customStartDate);
      endDate = formatUTCDateTime(customEndDate);
    }
    
    const response = await getQuizHistory(
      currentPage,
      itemsPerPage,
      dateFilter === 'all' ? null : dateFilter,
      startDate,
      endDate
    );
    
    setQuizHistory(response.data.quizHistory);
    setTotalItems(response.data.totalItems);
  } catch (error) {
    console.error('Error fetching quiz history:', error);
  } finally {
    setIsLoadingHistory(false);
  }
}
```

---

### TakeQuiz.jsx

**Location**: `src/pages/Common/Quiz/TakeQuiz.jsx`

**Purpose**: Interactive quiz-taking interface

#### Features

- Question display with multiple-choice options
- Progress tracking
- Timer functionality
- Answer selection validation
- Score calculation
- Result display

#### State Management

```javascript
const [questions, setQuestions] = useState([]);
const [currentQuestion, setCurrentQuestion] = useState(0);
const [selectedAnswers, setSelectedAnswers] = useState({});
const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
const [quizComplete, setQuizComplete] = useState(false);
```

#### Quiz Submission

```javascript
async function handleSubmitQuiz() {
  const answers = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
    question_id: questionId,
    selected_answer_id: answerId
  }));
  
  try {
    const response = await api.post('/quiz/submit', { answers });
    const { score, totalQuestions } = response.data;
    
    setQuizComplete(true);
    navigate('/quiz', { state: { newScore: score } });
  } catch (error) {
    ToastNotification('Failed to submit quiz', 'error');
  }
}
```

---

## DateRangePicker Modal

**Location**: `src/components/Modals/Calendar/DateRangePicker.jsx`

**Purpose**: Custom date range selector for quiz history filtering

### Features

- **Month/Year Dropdowns**: Quick navigation (100 years back)
- **Clickable From/To Fields**: Switch selection mode
- **Visual Range Highlighting**: Selected date range visualization
- **Outside Click Detection**: Auto-close on blur

### Props

```typescript
{
  fromDate: Date | null,
  toDate: Date | null,
  onDateChange: (from: Date, to: Date) => void,
  onClose: () => void
}
```

### Usage Example

```javascript
const [showDatePicker, setShowDatePicker] = useState(false);
const [customStartDate, setCustomStartDate] = useState(null);
const [customEndDate, setCustomEndDate] = useState(null);

function handleDateRangeChange(from, to) {
  setCustomStartDate(from);
  setCustomEndDate(to);
  setDateFilter('custom');
  setShowDatePicker(false);
}

<button onClick={() => setShowDatePicker(true)}>
  Custom Range
</button>

{showDatePicker && (
  <DateRangePicker
    fromDate={customStartDate}
    toDate={customEndDate}
    onDateChange={handleDateRangeChange}
    onClose={() => setShowDatePicker(false)}
  />
)}
```

---

## API Integration

### Service: quizService.js

**Location**: `src/services/features/quizService.js`

#### getQuizHistory

```javascript
export const getQuizHistory = async (page, limit, dateFilter = null, startDate = null, endDate = null) => {
  let url = `/quiz/history?page=${page}&limit=${limit}`;
  
  if (dateFilter) {
    url += `&dateFilter=${dateFilter}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
  }
  
  const response = await api.get(url);
  return response.data;
};
```

**Query Parameters**:
- `page` (number): Current page
- `limit` (number): Items per page
- `dateFilter` (string): `today`, `week`, `month`, `custom`, or `null`
- `startDate` (string): ISO 8601 datetime (UTC)
- `endDate` (string): ISO 8601 datetime (UTC)

**Response Structure**:
```json
{
  "data": {
    "quizHistory": [
      {
        "id": 1,
        "score": 8,
        "total_questions": 10,
        "percentage": 80,
        "created_at": "2026-02-21T10:30:00.000Z",
        "duration_seconds": 180
      }
    ],
    "totalItems": 42
  }
}
```

#### getQuizQuestions

```javascript
export const getQuizQuestions = async (quizId) => {
  const response = await api.get(`/quiz/questions/${quizId}`);
  return response.data;
};
```

#### submitQuiz

```javascript
export const submitQuiz = async (answers) => {
  const response = await api.post('/quiz/submit', { answers });
  return response.data;
};
```

---

## Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quiz/history` | Get paginated quiz history with filters |
| GET | `/quiz/questions/:id` | Fetch quiz questions |
| POST | `/quiz/submit` | Submit quiz answers |
| GET | `/quiz/certificates` | Get user's quiz certificates |

---

## Pagination Component

**Location**: `src/utils/Pagination.jsx`

### Server-Side Mode

```javascript
<Pagination
  data={quizHistory}
  itemsPerPage={5}
  serverSide={true}
  totalItems={totalItems}
  currentPage={currentPage}
  onPageChange={(page) => setCurrentPage(page)}
  renderItem={(quiz) => <QuizCard quiz={quiz} />}
/>
```

**Props**:
- `serverSide` (boolean): True for server-side pagination
- `totalItems` (number): Total count from backend
- `currentPage` (number): Current page number
- `onPageChange` (function): Page change callback

### Page Change Flow

```
User clicks page → onPageChange(newPage) → setCurrentPage(newPage)
                                                     ↓
                                          useEffect dependency triggers
                                                     ↓
                                          fetchQuizHistory() with new page
                                                     ↓
                                          API call: ?page=2&limit=5
                                                     ↓
                                          setQuizHistory(newData)
                                                     ↓
                                          Pagination component re-renders
```

---

## State Dependencies

### Quiz History Loading

```javascript
useEffect(() => {
  fetchQuizHistory();
}, [dateFilter, customStartDate, customEndDate, currentPage]);
```

**Triggers**:
- Date filter button clicked
- Custom date range selected
- Page changed

### Loading State Isolation

Only the quiz history section shows skeleton loader:

```javascript
{isLoadingHistory ? (
  <SkeletonCard count={5} />
) : (
  <Pagination ... />
)}
```

Statistics cards and certificates sections remain static during history refresh.

---

## Validation Logic

### Date Range Validation

```javascript
if (customStartDate && customEndDate) {
  if (customStartDate > customEndDate) {
    ToastNotification('Start date must be before end date', 'error');
    return;
  }
  
  const daysDiff = (customEndDate - customStartDate) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    ToastNotification('Date range cannot exceed 1 year', 'warning');
    return;
  }
}
```

### Quiz Submission Validation

```javascript
if (Object.keys(selectedAnswers).length !== questions.length) {
  ToastNotification('Please answer all questions', 'warning');
  return;
}
```

---

## Edge Cases

### No Quiz Records

Display empty state with icon:

```javascript
{quizHistory.length === 0 && (
  <div className="flex flex-col items-center justify-center py-20">
    <Task size={48} defaultColor="#145B47" />
    <p className="text-lg font-semibold text-primary mt-4">
      No Quiz record found
    </p>
    <p className="text-sm text-secondaryDark mt-2">
      Try selecting a different date range
    </p>
  </div>
)}
```

### Network Errors

```javascript
catch (error) {
  console.error('Error fetching quiz history:', error);
  ToastNotification('Failed to load quiz history', 'error');
  setQuizHistory([]);
}
```

### Timezone Handling

Frontend calculates date ranges in local timezone and converts to UTC for backend:

```javascript
// Local timezone: February 21, 2026 00:00:00
// Converted to UTC: 2026-02-21 00:00:00 (formatted as string)
const startDate = formatUTCDateTime(localDate);
```

Backend compares UTC timestamps:

```sql
WHERE created_at >= ? AND created_at < ?
```

---

## User Experience Flow

1. User navigates to `/quiz`
2. Statistics loaded (total quizzes, average score, etc.)
3. Quiz history displayed (default: all records)
4. User clicks "This Week" filter button
5. Loading skeleton appears
6. API fetches week's records
7. Pagination updates with new data
8. User clicks "Custom Range"
9. DateRangePicker modal opens
10. User selects from/to dates
11. Modal closes, skeleton appears
12. Filtered results displayed
13. User clicks page 2
14. Next 5 records loaded

---

## Performance Optimizations

- **Server-Side Pagination**: Limits data transfer
- **Selective Re-fetching**: Only quiz history section re-fetches
- **Skeleton Loading**: Prevents layout shift
- **Debounced Search**: (If search feature added)
- **Memoized Calculations**: Use `useMemo` for expensive computations
