# Hip Hop Calendar — Mobile API Guide

**Base URL:** `https://ojteyqniztizydtrxjid.supabase.co`

**Required headers on every REST request:**
```
apikey: sb_publishable_joo9_JKHceyfseN-SQ9WmA_8iMfkH7s
Content-Type: application/json
```

---

## ⚠️ Tables That Exist

| Table | Purpose |
|---|---|
| `albums` | All album data including streams, certification, ranking |
| `events` | Calendar events |
| `favorites` | User saved favorites |
| `app_users` | Mobile app users |
| `push_tokens` | FCM push notification tokens |
| `profiles` | Admin/editor users only — do NOT use in mobile |

**There is NO `tracks` table.**
**There is NO `certificates` table.**
**There is NO `device_tokens` table — use `push_tokens`.**

---

## 1. User Registration

On first launch, generate a UUID v4 as `device_id` and store it permanently in local storage. Never regenerate it.

**Step 1 — Check if user exists:**
```
GET /rest/v1/app_users?device_id=eq.<device_id>&select=*
```

**Step 2a — Not found → Register:**
```
POST /rest/v1/app_users
Body: {
  "device_id": "<uuid>",
  "username": "User_<first8charsOfDeviceId>",
  "last_login": "<iso_timestamp>"
}
```

**Step 2b — Found → Update last login:**
```
PATCH /rest/v1/app_users?device_id=eq.<device_id>
Body: { "last_login": "<iso_timestamp>" }
```

**Response:**
```json
{
  "id": "uuid",
  "device_id": "abc-123",
  "username": "User_abc12345",
  "created_at": "2026-03-09T21:00:00Z",
  "last_login": "2026-03-09T21:00:00Z"
}
```
> Save `id` as `user_id` in local storage — used for push token registration.

---

## 2. Push Notification Setup

Do this right after user registration, once Firebase SDK gives you the FCM token.

**Register token:**
```
POST /rest/v1/push_tokens
Headers: Prefer: resolution=merge-duplicates
Body: {
  "token": "<fcm_token_from_firebase>",
  "platform": "android",
  "user_id": "<app_users.id>"
}
```

> Use `Prefer: resolution=merge-duplicates` header — inserts if new, ignores if already exists.

**Update token when Firebase rotates it:**
```
PATCH /rest/v1/push_tokens?token=eq.<old_token>
Body: { "token": "<new_fcm_token>" }
```

**Delete token on logout:**
```
DELETE /rest/v1/push_tokens?token=eq.<fcm_token>
```

---

## 3. Push Notification Payload

**Android** receives a `data` payload (handle manually in app):
```json
{
  "data": {
    "title": "New Milestone",
    "body": "Boosie Badazz's \"For My Thugz\" is now officially RIAA Gold! 🏆",
    "album_id": "uuid-of-album",
    "url": "https://www.hiphopcalendar.live/albums/uuid-of-album"
  }
}
```
> On tap → navigate to album detail screen using `data.album_id`

**iOS** receives a notification payload:
```json
{
  "aps": {
    "alert": {
      "title": "New Milestone",
      "body": "Boosie Badazz's \"For My Thugz\" is now officially RIAA Gold! 🏆"
    },
    "sound": "default"
  }
}
```
> Also check `userInfo["album_id"]` on tap to navigate to the album.

### Notification Types

| Type | When | Title | Body |
|---|---|---|---|
| New Album | Admin adds album | `New Album Drop` | `{Artist} just dropped "{Title}". Listen now!` |
| Album Updated | Admin updates album | `Album Updated` | `{Artist}'s "{Title}" has been updated.` |
| Certification | Admin sets certification | `New Milestone` | `{Artist}'s "{Title}" is now officially RIAA {Cert}!` |
| Anniversary | Release date hits 5yr milestone | `Hip Hop Anniversary` | `{N} Years Ago Today: {Artist} released "{Title}"` |
| Billboard | #1 date hits 5yr milestone | `Billboard History` | `On this day in {Year}, {Artist} hit #1 on the Billboard 200` |

---

## 4. Calendar Events

**Get all events for a month:**
```
GET /rest/v1/events_by_month_day?month=eq.<1-12>&order=event_date.asc&limit=500
```

**Get events for a specific day:**
```
GET /rest/v1/events_by_month_day?month=eq.<month>&day=eq.<day>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "event_date": "2026-03-15",
    "name": "Dr. Dre Birthday",
    "txt_color": "#FFFFFF",
    "color": "#948C80",
    "month": 3,
    "day": 15
  }
]
```

---

## 5. Albums

**Get albums by calendar date** (when user taps a date):
```
GET /rest/v1/albums_by_month_day?month=eq.<month>&day=eq.<day>&order=artist.asc
```

**Get all albums** (paginated):
```
GET /rest/v1/albums?select=*&order=release_date.desc&limit=20&offset=0
```

**Search albums:**
```
GET /rest/v1/albums?or=(title.ilike.*<query>*,artist.ilike.*<query>*)&order=release_date.desc&limit=50
```

**Response fields:**
```json
{
  "id": "uuid",
  "title": "The Chronic",
  "artist": "Dr. Dre",
  "release_date": "1992-12-15",
  "cover": "https://...image_url...",
  "image": "https://...image_url...",
  "color": "#948C80",
  "ranking": "#1",
  "certification": "Diamond",
  "streams": "1.2B",
  "spotify": "https://open.spotify.com/...",
  "apple": "https://music.apple.com/...",
  "custom_link": "https://...",
  "custom_link_label": "YouTube"
}
```

---

## 6. Single Album with Stats

**Always use this endpoint when opening album detail — never call `/rest/v1/albums` directly for a single album.**

Stats (streams, certification, ranking) refresh automatically every month via AI. This endpoint handles that.

```
POST /functions/v1/get-album-stats
Content-Type: application/json
Body: { "album_id": "<uuid>" }
```

> No `apikey` header needed for this endpoint.

**Response:**
```json
{
  "source": "fresh",
  "album": {
    "id": "uuid",
    "title": "The Chronic",
    "artist": "Dr. Dre",
    "streams": "1.2B",
    "certification": "Diamond",
    "ranking": "#1",
    "stats_month": "2026-03",
    "stats_last_checked": "2026-03-09T21:00:00Z",
    "spotify": "https://open.spotify.com/...",
    "apple": "https://music.apple.com/...",
    "cover": "https://...image_url...",
    "color": "#948C80"
  }
}
```

`source` values — display the album data regardless:
- `fresh` — stats are current for this month
- `cached_queued` — stats are being refreshed in background, showing last known data

---

## 7. Favorites

**Get all favorites:**
```
GET /rest/v1/favorites?select=*&order=display_order.asc
```

**Add to favorites:**
```
POST /rest/v1/favorites
Body: {
  "title": "The Chronic",
  "artist": "Dr. Dre",
  "cover": "https://...",
  "image": "https://...",
  "color": "#948C80",
  "spotify": "https://...",
  "apple": "https://...",
  "display_order": 0
}
```

**Remove from favorites:**
```
DELETE /rest/v1/favorites?id=eq.<favorite_id>
```

**Reorder favorites:**
```
PATCH /rest/v1/favorites?id=eq.<favorite_id>
Body: { "display_order": <number> }
```

---

## Full App Launch Sequence

```
1. Load or generate device_id          → UUID v4, store in local storage permanently
2. GET  /app_users?device_id=...       → check if registered
3. POST or PATCH /app_users            → register / update last_login → save user_id locally
4. Request notification permission     → from OS
5. Get FCM token                       → from Firebase SDK
6. POST /push_tokens                   → register token (with Prefer: resolution=merge-duplicates)
7. Listen for FCM token refresh        → PATCH /push_tokens with new token
8. GET  /events_by_month_day?month=... → load current month calendar
```

---

## Error Responses

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request — check your body |
| `404` | Not found |
| `409` | Conflict — duplicate insert |
| `PGRST205` | Table does not exist — you are calling a wrong endpoint |
