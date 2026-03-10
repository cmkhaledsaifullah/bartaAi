# E2E Test Suite Structure

This directory contains the end-to-end tests for BartaAI, organized by functionality and viewport.

## File Structure

### Helper Files

- **`helpers.ts`** - Common utilities, setup functions, constants, and selectors used across all e2e tests

### Test Files

#### Desktop Tests

- **`desktop-chat.e2e.test.ts`** - Tests for chat functionality and RAG (Retrieval Augmented Generation) on desktop
- **`desktop-knowledgeBase.e2e.test.ts`** - Tests for knowledge base display and interaction on desktop
- **`desktop-navigation.e2e.test.ts`** - Tests for tab navigation, settings panel, and UI state management on desktop

#### Mobile Tests

- **`mobile.e2e.test.ts`** - All mobile-specific tests including:
  - Knowledge base rendering and navigation
  - Chat and RAG functionality
  - View toggling (article/chunk views)
  - Input handling and form submission
  - Layout and viewport-specific behavior

## Running Tests

Run all e2e tests:

```bash
npm run test:e2e
```

Run specific test file:

```bash
npx vitest run src/e2e/desktop-chat.e2e.test.ts
```

Run tests in watch mode:

```bash
npx vitest src/e2e/
```

## Test Organization Principles

1. **Separation by Viewport**: Desktop and mobile tests are separated to make it easier to focus on viewport-specific issues
2. **Separation by Functionality**: Desktop tests are further divided by feature area (chat, knowledge base, navigation)
3. **Shared Utilities**: Common setup, constants, and helper functions are centralized in `helpers.ts`
4. **Consistent Naming**: Test files follow the pattern `{viewport}-{feature}.e2e.test.ts`

## Common Patterns

### Using Helper Functions

```typescript
import { 
  buildDriver, 
  closeDriver, 
  openApp, 
  submitQuery,
  switchToKnowledgeTab 
} from './helpers'

// In your test
await openApp(driver, DESKTOP_VIEWPORT)
await submitQuery(driver, 'your query here')
```

### Using Selectors

```typescript
import { SELECTORS } from './helpers'

const element = await driver.findElement(By.css(SELECTORS.chatPanel))
```

## Adding New Tests

1. Determine if the test is desktop or mobile specific
2. Add to the appropriate test file
3. Use helper functions and selectors from `helpers.ts`
4. If you need new common utilities, add them to `helpers.ts`
