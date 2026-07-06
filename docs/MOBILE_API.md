# Mobile API Documentation

This document describes the API functions available for mobile app integration.

## Setup

1. Run the SQL in `database-updates.sql` to create the `app_users` table
2. Import the API functions from `src/api/mobile.ts`

```typescript
import {
  registerAppUser,
  getEventsByMonth,
  getAlbumsByDate,
  getAlbumById,
  searchAlbums,
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavoriteOrder,
} from "@/api/mobile";
```

## API Functions

### 1. User Registration (Device ID Tracking)

#### `registerAppUser(deviceId: string, username: string)`

Register or update a user with their device ID. This is for tracking purposes only, not authentication.

**Parameters:**

- `deviceId`: Unique device identifier (e.g., UUID from device)
- `username`: User's display name

**Returns:**

```typescript
{
  data: AppUser | null,
  error: any
}
```

**Example:**

```typescript
const { data, error } = await registerAppUser("device-uuid-123", "John Doe");
if (error) {
  console.error("Registration failed:", error);
} else {
  console.log("User registered:", data);
}
```

---

### 2. Calendar Events

#### `getEventsByMonth(month: number)`

Get all events for a specific month (ignores year).

**Parameters:**

- `month`: Month number (1-12, where 1 = January)

**Returns:**

```typescript
{
  data: Event[] | null,
  error: any
}
```

**Event Object:**

```typescript
{
  id: string,
  event_date: string,  // ISO date format
  month: number,       // 1-12
  day: number,         // 1-31
  name: string,        // Album name or "+N" count
  txt_color: string,   // Text color hex
  color: string        // Background color hex
}
```

**Example:**

```typescript
// Get January events
const { data, error } = await getEventsByMonth(1);
if (data) {
  // Group by day for calendar display
  const eventsByDay = {};
  data.forEach((event) => {
    if (!eventsByDay[event.day]) {
      eventsByDay[event.day] = [];
    }
    eventsByDay[event.day].push(event);
  });
}
```

---

### 3. Albums

#### `getAlbumsByDate(month: number, day: number)`

Get all albums released on a specific month and day (ignores year).

**Parameters:**

- `month`: Month number (1-12)
- `day`: Day number (1-31)

**Returns:**

```typescript
{
  data: Album[] | null,
  error: any
}
```

**Album Object:**

```typescript
{
  id: string,
  release_date: string,
  title: string,
  artist: string,
  dob: string,
  age: string,
  color: string,
  cover: string,
  image: string,
  spotify: string,
  apple: string,
  ranking: string,
  certification: string,
  streams: string
}
```

**Example:**

```typescript
// Get albums for January 15
const { data, error } = await getAlbumsByDate(1, 15);
```

#### `getAlbumById(albumId: string)`

Get detailed information for a specific album.

**Parameters:**

- `albumId`: Album UUID

**Returns:**

```typescript
{
  data: Album | null,
  error: any
}
```

**Example:**

```typescript
const { data, error } = await getAlbumById("album-uuid-123");
```

#### `searchAlbums(query: string)`

Search albums by title or artist name.

**Parameters:**

- `query`: Search term

**Returns:**

```typescript
{
  data: Album[] | null,
  error: any
}
```

**Example:**

```typescript
const { data, error } = await searchAlbums("Drake");
```

---

### 4. Favorites

#### `getFavorites()`

Get all favorite albums.

**Returns:**

```typescript
{
  data: Favorite[] | null,
  error: any
}
```

**Favorite Object:**

```typescript
{
  id: string,
  title: string,
  artist: string,
  dob: string,
  age: string,
  color: string,
  cover: string,
  image: string,
  spotify: string,
  apple: string,
  display_order: number
}
```

**Example:**

```typescript
const { data, error } = await getFavorites();
```

#### `addFavorite(album: Partial<Album>)`

Add an album to favorites.

**Parameters:**

```typescript
{
  title: string,
  artist: string,
  dob?: string,
  age?: string,
  color?: string,
  cover?: string,
  image?: string,
  spotify?: string,
  apple?: string,
  display_order?: number
}
```

**Returns:**

```typescript
{
  data: Favorite | null,
  error: any
}
```

**Example:**

```typescript
const { data, error } = await addFavorite({
  title: "Album Name",
  artist: "Artist Name",
  image: "https://...",
  display_order: 0,
});
```

#### `removeFavorite(favoriteId: string)`

Remove an album from favorites.

**Parameters:**

- `favoriteId`: Favorite UUID

**Returns:**

```typescript
{
  error: any;
}
```

**Example:**

```typescript
const { error } = await removeFavorite("favorite-uuid-123");
```

#### `updateFavoriteOrder(favoriteId: string, displayOrder: number)`

Update the display order of a favorite.

**Parameters:**

- `favoriteId`: Favorite UUID
- `displayOrder`: New order position (0-based)

**Returns:**

```typescript
{
  data: Favorite | null,
  error: any
}
```

**Example:**

```typescript
const { data, error } = await updateFavoriteOrder("favorite-uuid-123", 5);
```

---

## Usage Flow

### 1. App Launch

```typescript
// Register/update user
await registerAppUser(deviceId, username);
```

### 2. Calendar View

```typescript
// Get events for current month
const { data: events } = await getEventsByMonth(currentMonth);

// User taps on a date
const { data: albums } = await getAlbumsByDate(month, day);
```

### 3. Album Detail

```typescript
// User taps on an album
const { data: album } = await getAlbumById(albumId);
```

### 4. Favorites

```typescript
// Load favorites
const { data: favorites } = await getFavorites();

// Add to favorites
await addFavorite(albumData);

// Remove from favorites
await removeFavorite(favoriteId);

// Reorder favorites
await updateFavoriteOrder(favoriteId, newOrder);
```

---

## Error Handling

All functions return an error object if something goes wrong:

```typescript
const { data, error } = await someFunction();

if (error) {
  console.error("Error:", error);
  // Handle error (show message to user, retry, etc.)
} else {
  // Use data
}
```

---

## Notes

- All dates ignore the year - events and albums are matched by month and day only
- Device ID is for tracking only, no authentication required
- All data is publicly readable (RLS policies allow public access)
- Duplicates are automatically filtered in `getAlbumsByDate()`
