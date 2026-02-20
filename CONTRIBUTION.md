# Contributing Guidelines

This document outlines our team's code acceptance criteria and best practices for our React application. Following these guidelines ensures consistency and maintainability across our codebase.

## Code Style and Formatting

### CSS Guidelines

- Avoid using percentage values for positioning attributes (e.g., `top`, `left`, `right`, `bottom`)

  **Reason**: Percentage-based positioning can cause unpredictable behavior depending on the parent element's dimensions. Using pixel values ensures more precise and consistent placement.

  ```css
  /* ❌ Don't do this */
  .element {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  /* ✅ Do this instead */
  .element {
    position: absolute;
    top: 50px;
    left: 50px;
  }
  ```

### Event Handler Naming

- Use descriptive names for event handlers that indicate the action being performed
- Avoid generic names like `handle` or `handleClick`

  **Reason**: Descriptive names improve readability and make the code easier to understand, especially in larger codebases.

```jsx
/* ❌ Don't do this */
const handle = (e) => {
  // ...
};

/* ✅ Do this instead */
const handleUserProfile = (e) => {
  // ...
};
```

### Documentation

- Use JSDoc comments only for:
  1. Utility functions
  2. Component function declarations
- Avoid excessive documentation for self-explanatory code.

```jsx
/* ✅ Good - JSDoc for utility function */
/**
 * Formats a date string into a localized date format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  // ...
};

/* ❌ Don't do this - over-documentation */
/**
 * useState hook to manage the state of the count
 * @param {number} count - The initial count value
 * @returns {Array} An array with the state value and a function to update it
 */
const [count, setCount] = useState(0);
```

### JSX Formatting

#### Spacing

- Don't use empty string expressions (`{''}`) to add spacing
- Use CSS margins or padding instead

```jsx
/* ❌ Don't do this */
<div>
  First Item {''} Second Item
</div>

/* ✅ Do this instead */
<div className="space-x-2">
  <span>First Item</span>
  <span>Second Item</span>
</div>
```

#### Event Handlers

- Avoiding creating `anonymous` functions

```jsx
/* ❌ Don't do this */
const handleUserAvatarItemClick = (itemId) => {
  //. ...
};
list.map((item) => <UserAvatarItem onClick={() => handleUserAvatarItemClick(item?.id)} />);

/* ✅ Do this instead */
const handleUserAvatarItemClick = (itemId) => () => {
  //. ...
};
list.map((item) => <UserAvatarItem onClick={handleUserAvatarItemClick(item?.id)} />);
```

#### Component Structure

- Maintain proper indentation for all JSX
- Break down complex JSX into multiple lines for readability
- Don't write static JSX in a single line without indentation

```jsx
/* ❌ Don't do this */
const Header = () => (
  <div>
    <h1>Welcome</h1>
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
      </ul>
    </nav>
  </div>
);

/* ✅ Do this instead */
const Header = () => (
  <div>
    <h1>Welcome</h1>
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
      </ul>
    </nav>
  </div>
);
```
