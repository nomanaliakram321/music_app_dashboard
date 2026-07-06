# Album Scripts

## 1. Album Comparison Script

This script compares album data between your `constants.ts` file and the Supabase `albums` table to identify missing albums.

## Usage

### Quick Run

```bash
npm run check-albums
```

### Manual Run

```bash
tsx src/scripts/check-missing-albums.ts
```

## Prerequisites

Make sure you have the following environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Output

The script generates three types of output:

### 1. Console Output
A formatted report showing:
- Summary statistics (total albums, missing count, match rate)
- Missing albums grouped by date
- Details for each missing album (title, artist, release date)

### 2. JSON Report (`missing-albums-report.json`)
A comprehensive JSON file containing:
```json
{
  "generatedAt": "2025-01-15T10:30:00.000Z",
  "summary": {
    "totalInConstants": 500,
    "totalInSupabase": 450,
    "missingCount": 50,
    "matchRate": "90.00"
  },
  "missingAlbums": [...],
  "missingByDate": {...}
}
```

### 3. CSV Export (`missing-albums.csv`)
A CSV file ready for import or review in Excel/Sheets:
- Date
- Title
- Artist
- Release Date
- Spotify URL
- Apple Music URL
- Image URL

## Matching Logic

The script uses two-level matching:
1. **Primary**: Matches on both album name AND artist (case-insensitive)
2. **Fallback**: If primary fails, matches on album name only
   - Albums found only by name are flagged with "artist mismatch"

## Example Output

```
═══════════════════════════════════════════════════════════
📊 COMPARISON SUMMARY
═══════════════════════════════════════════════════════════
Total albums in constants.ts: 500
Total albums in Supabase:     450
Missing albums:               50
Match rate:                   90.00%
═══════════════════════════════════════════════════════════

❌ MISSING ALBUMS:

📅 2025-01-01 (3 missing):
   1. "Album Title" by Artist Name
      Released: January 01, 2020
      Reason: Not found in Supabase
   ...
```

## Troubleshooting

### "Missing Supabase credentials" Error
Make sure your `.env` file exists and contains valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

### "Supabase error" Messages
Check that:
- Your Supabase credentials are correct
- The `albums` table exists in your database
- You have read permissions on the `albums` table

### Script Doesn't Find Missing Albums
Verify that:
- The album names in `constants.ts` match the format in Supabase
- Special characters and spacing are consistent
- The `name` and `artist` fields exist in your Supabase `albums` table

---

## 2. Album Import Script

This script imports missing albums from the generated JSON file into your Supabase database.

### Usage

```bash
npm run import-albums
```

### How It Works

The script will:
1. Read the `missing-albums-2026-02-12.json` file from `src/data/`
2. Group albums by their date
3. For each unique date:
   - Check if an event exists for that date
   - If not, create a new event
   - Import all albums for that date, linking them to the event
4. Skip albums that already exist (no duplicates)

### Event-Album Relationship

**How albums are related to events:**
- Albums are grouped by their release date (the `date` field in the JSON)
- Each unique date gets one event
- All albums released on the same date belong to the same event
- Events are named like: "January 1, 2025"

**Example:**
```
Event: "January 1, 2025" (event_id: abc-123)
├── Album: "Puss 'N Boots" by Professor X
├── Album: "In My Feelings" by Boosie Badazz
└── ... (all other albums from 2025-01-01)
```

### Field Mapping

From JSON to Supabase `albums` table:
- `title` → `name`
- `artist` + `dob` → `description`
- `image` → `cover_image_url`
- `dob` → `release_date` (parsed to YYYY-MM-DD format)
- `date` → used to find/create the event

### Output Example

```
🚀 Starting album import process...

📖 Reading missing albums JSON file...
✅ Found 2826 missing albums to import

📅 Albums grouped into 245 unique dates

🔍 Fetching existing events...
✅ Found 123 existing events

📆 Processing 2025-01-01 (2 albums)...
   ✓ Using existing event: "January 1, 2025"
   ✅ Imported: "Puss 'N Boots"
   ✅ Imported: "In My Feelings"
   📊 Date complete: 2 imported, 0 skipped

📆 Processing 2025-01-04 (1 albums)...
   ➕ Creating new event: "January 4, 2025"
   ✓ Event created with ID: xyz-789
   ✅ Imported: "Under Hawk's Wings"
   📊 Date complete: 1 imported, 0 skipped

════════════════════════════════════════════════════════════
📊 IMPORT SUMMARY
════════════════════════════════════════════════════════════
Total albums in JSON:     2826
✅ Successfully imported:  2826
⏭️  Skipped (duplicates):  0
❌ Errors:                0
════════════════════════════════════════════════════════════

✅ Import process completed!
```

### Safety Features

- ✅ **Duplicate prevention**: Skips albums that already exist
- ✅ **Event reuse**: Uses existing events instead of creating duplicates
- ✅ **Error handling**: Continues processing even if individual albums fail
- ✅ **Detailed logging**: Shows progress for each date and album

### Important Notes

⚠️ **Before running the import:**
1. Make sure you have a backup of your database
2. Review the JSON file to ensure the data looks correct
3. Test with a small subset first if you're unsure

⚠️ **Database permissions:**
- You need INSERT permissions on both `events` and `albums` tables
- The script uses the ANON key from your `.env` file

### Troubleshooting

**"JSON file not found" Error**
- Make sure `missing-albums-2026-02-12.json` exists in `src/data/`
- Check the filename matches exactly

**"Failed to create event" Error**
- Verify you have INSERT permissions on the `events` table
- Check that all required event fields are provided

**Albums not importing**
- Check console output for specific error messages
- Verify the `albums` table schema matches the script's expectations
- Ensure image URLs are valid and accessible
