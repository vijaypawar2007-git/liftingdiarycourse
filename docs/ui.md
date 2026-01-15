# UI Coding Standards

This document outlines the strict UI development standards for this project.

## Component Library

### shadcn/ui - MANDATORY

**CRITICAL REQUIREMENT:** This project uses **shadcn/ui** exclusively for all UI components.

- ✅ **ONLY use shadcn/ui components** for all UI elements
- ❌ **ABSOLUTELY NO custom components** should be created
- ❌ **NO other component libraries** (Material-UI, Ant Design, Chakra UI, etc.)

### Available shadcn/ui Components

When you need a UI element, always use the appropriate shadcn/ui component:

- **Layout:** Card, Separator, Tabs, Sheet, Dialog
- **Forms:** Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Label, Form
- **Data Display:** Table, Badge, Avatar, Calendar, Progress, Skeleton
- **Feedback:** Alert, Alert Dialog, Toast, Popover, Tooltip, Hover Card
- **Navigation:** Navigation Menu, Dropdown Menu, Context Menu, Menubar, Breadcrumb, Pagination
- **Overlay:** Dialog, Sheet, Drawer, Popover, Alert Dialog
- **Typography:** Typography components from shadcn/ui

### Installation

When a new component is needed, install it using the shadcn/ui CLI:

```bash
npx shadcn@latest add [component-name]
```

Examples:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
```

## Date Formatting

### Library: date-fns

All date formatting **MUST** be done using `date-fns`.

### Standard Date Format

Dates should be formatted with the following pattern: **ordinal day, abbreviated month, full year**

**Examples:**
- `1st Sep 2025`
- `2nd Aug 2025`
- `3rd Jan 2026`
- `4th Jun 2024`
- `21st Dec 2025`
- `22nd Mar 2026`
- `23rd Nov 2024`

### Implementation

```typescript
import { format } from 'date-fns';

// Helper function for consistent date formatting
const formatDate = (date: Date): string => {
  const day = format(date, 'd');
  const month = format(date, 'MMM');
  const year = format(date, 'yyyy');

  // Add ordinal suffix
  const suffix = getOrdinalSuffix(parseInt(day));

  return `${day}${suffix} ${month} ${year}`;
};

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};
```

### Usage

```typescript
import { formatDate } from '@/lib/date-utils';

const displayDate = formatDate(new Date('2025-09-01')); // "1st Sep 2025"
```

## Styling

- Use Tailwind CSS v4 for all styling
- Follow the existing theme tokens defined in `src/app/globals.css`
- Do not write custom CSS files unless absolutely necessary
- Leverage shadcn/ui's built-in styling and variants

## Key Principles

1. **No Custom Components**: If shadcn/ui has a component for your use case, use it. Do not create alternatives.
2. **Consistency**: All UI elements should come from shadcn/ui to ensure visual consistency.
3. **Accessibility**: shadcn/ui components are built with accessibility in mind - use them as intended.
4. **Date Consistency**: Always use the specified date format throughout the application.

## Enforcement

These standards are **mandatory** for all code in this project. Code reviews should reject any:
- Custom UI components that duplicate shadcn/ui functionality
- Use of other component libraries
- Inconsistent date formatting
- Dates not formatted using date-fns
