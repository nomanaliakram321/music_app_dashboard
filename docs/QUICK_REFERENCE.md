# Quick Reference - Album Management System

## What Was Fixed

### ✅ Form Field Consistency

- **Add Album Form** now has ALL the same fields as Edit Album Form
- Fields added: DOB, Age, Color, Custom Link, Custom Link Label
- All optional fields work correctly

### ✅ Custom Link Feature

- Users can now add a third music platform link (YouTube, SoundCloud, etc.)
- Custom label allows users to name the platform
- Displays on album detail page alongside Spotify and Apple Music

### ✅ Events Auto-Update

- **Adding album** (form or CSV) → Events regenerate automatically ✓
- **Editing album** → Events regenerate automatically ✓
- **Deleting album** → Events regenerate automatically ✓
- Calendar reflects changes immediately ✓
- Dashboard shows correct event count ✓

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_link TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_link_label TEXT DEFAULT 'Other';
```

## Form Fields Reference

### Add Album Form (Upload Page)

**Required:**

- Release Date
- Title
- Artist

**Optional:**

- Artist DOB (Date of Birth)
- Artist Age
- Album Color (color picker, defaults to random if empty)
- Image (upload or URL)
- Spotify URL
- Apple Music URL
- Custom Link URL
- Custom Link Label (e.g., "YouTube", "SoundCloud")
- Ranking
- Certification
- Streams

### Edit Album Form (Album Detail Page)

Same fields as Add Album Form - all editable

## CSV Upload Format

```csv
release_date,title,artist,dob,age,color,image,spotify,apple,custom_link,custom_link_label,ranking,certification,streams
2025-01-15,Album Name,Artist Name,1990-05-20,35,#FF5733,https://...,https://spotify.com/...,https://apple.com/...,https://youtube.com/...,YouTube,#1,Gold,1M
```

**Required columns:** release_date, title, artist
**All other columns:** Optional

## How Events Work Now

1. **Album Added** → System finds all albums for that month-day → Creates/updates events
2. **Album Edited** → System finds all albums for that month-day → Recreates events with updated info
3. **Album Deleted** → System finds remaining albums for that month-day → Updates events (removes if no albums left)

Events show:

- First 2 unique artists on that date
- "+X more" indicator if more than 2 artists
- Uses album color for event background

## Testing Your Changes

1. **Test Add Album:**
   - Go to Upload page
   - Fill out form with all fields including custom link
   - Submit
   - Check Calendar - should see event on that date
   - Check Dashboard - event count should increase

2. **Test Edit Album:**
   - Go to any album detail page
   - Click Edit
   - Change any field (try changing color or adding custom link)
   - Save
   - Check Calendar - event should reflect changes

3. **Test Delete Album:**
   - Go to any album detail page
   - Click Delete
   - Confirm deletion
   - Check Calendar - event should update or disappear if it was the only album

4. **Test CSV Upload:**
   - Create CSV with new fields
   - Upload via Upload page
   - Check Calendar - all albums should appear with events

## Files Modified

- `src/types/database.ts` - Added custom_link fields to Album type
- `src/pages/Upload.tsx` - Added all missing fields to Add Album form
- `src/pages/AlbumDetail.tsx` - Added custom_link fields, auto-regenerate events on edit/delete
- `update-albums-schema.sql` - Database migration script

## No Breaking Changes

- All new fields are optional
- Existing albums work without changes
- CSV uploads work with or without new fields
- Backward compatible with existing data
