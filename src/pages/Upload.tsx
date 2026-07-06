import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { uploadImage, deleteImage } from "@/lib/storage";
import { DiamondAlbumCard } from "@/components/DiamondAlbumCard";
import {
  Upload as UploadIcon,
  FileText,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { NotificationClient } from "@/lib/notification-client";

// Color and cover arrays for random selection
const COLORS = [
  "#948C80",
  "#C77ACA",
  "#007EE6",
  "#004294",
  "#FF6D27",
  "#A3D400",
];

const COVERS = [
  "fav_cover1",
  "fav_cover5",
  "fav_cover3",
  "fav_cover7",
  "fav_cover2",
  "fav_cover9",
];

// Helper function to get random color and cover
const getRandomColorAndCover = () => {
  const randomIndex = Math.floor(Math.random() * COLORS.length);
  return {
    color: COLORS[randomIndex],
    cover: COVERS[randomIndex],
  };
};

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  // Form state for adding individual album
  const [formData, setFormData] = useState({
    release_date: "",
    title: "",
    artist: "",
    image: "",
    diamond_card: false,
    spotify: "",
    apple: "",
    custom_link: "",
    custom_link_label: "YouTube",
    ranking: "",
    certification: "",
    streams: "",
  });

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAlbumsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Parse and preview the file
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const data = rows.slice(1);

      const albums = data.map((row) => {
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || null;
        });

        // Get random color and cover if not provided in CSV
        const { color, cover } =
          obj.color && obj.cover
            ? { color: obj.color, cover: obj.cover }
            : getRandomColorAndCover();

        return {
          release_date: obj.release_date || obj.dob,
          title: obj.title,
          artist: obj.artist,
          dob: obj.dob || obj.release_date,
          age: obj.age || null,
          color: color,
          cover: cover,
          image: obj.image,
          diamond_card:
            obj.diamond_card === "true" ||
            obj.diamond_card === "1" ||
            obj.diamond_card === "yes",
          spotify: obj.spotify,
          apple: obj.apple,
          custom_link: obj.custom_link || null,
          custom_link_label: obj.custom_link_label || "Other",
          ranking: obj.ranking,
          certification: obj.certification,
          streams: obj.streams,
        };
      });

      setPreviewData(albums);
    } catch (error: any) {
      console.error("Preview error:", error);
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
      setSelectedFile(null);
      e.target.value = "";
    }
  };

  const confirmUpload = async () => {
    if (!previewData.length) return;

    setUploading(true);
    try {
      const { error: insertError } = await supabase
        .from("albums")
        .insert(previewData);

      if (insertError) throw insertError;

      // Regenerate events for the uploaded dates
      try {
        await regenerateEvents(previewData.map((a) => a.release_date));
      } catch (eventError: any) {
        console.error("Event regeneration error:", eventError);
        // Don't fail the whole upload if event regeneration fails
      }

      toast({
        title: "Success",
        description: `Imported ${previewData.length} albums and updated events`,
      });

      // Reset
      setSelectedFile(null);
      setPreviewData([]);
      const fileInput = document.getElementById(
        "albums-file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload albums",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewData([]);
    const fileInput = document.getElementById(
      "albums-file",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const regenerateEvents = async (dates: string[]) => {
    // Extract unique month-day combinations
    const monthDaySet = new Set<string>();
    dates.forEach((date) => {
      const [year, month, day] = date.split("-");
      monthDaySet.add(`${month}-${day}`);
    });

    for (const monthDay of monthDaySet) {
      const [month, day] = monthDay.split("-");

      // Get ALL albums for this month-day (across all years)
      const { data: albums } = await supabase
        .from("albums_by_month_day")
        .select("*")
        .eq("month", parseInt(month))
        .eq("day", parseInt(day))
        .order("artist");

      if (!albums || albums.length === 0) continue;

      // Get unique artists (first 2)
      const uniqueArtists = [...new Set(albums.map((a) => a.artist))];
      const displayArtists = uniqueArtists.slice(0, 2);

      // Delete existing events for this month-day (across all years)
      const monthStr = month.toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");

      // Get all events and filter by month-day in JavaScript
      const { data: allEvents } = await supabase
        .from("events")
        .select("event_date");

      const existingEvents =
        allEvents?.filter((evt) => {
          const evtDate = evt.event_date;
          return evtDate.endsWith(`-${monthStr}-${dayStr}`);
        }) || [];

      if (existingEvents && existingEvents.length > 0) {
        for (const evt of existingEvents) {
          await supabase
            .from("events")
            .delete()
            .eq("event_date", evt.event_date);
        }
      }

      // Use the most recent year for the event_date
      const latestYear = Math.max(
        ...albums.map((a) => new Date(a.release_date).getFullYear()),
      );
      const eventDate = `${latestYear}-${month}-${day}`;

      const events = [];

      for (const artistName of displayArtists) {
        const artistAlbum = albums.find((a) => a.artist === artistName);
        if (artistAlbum) {
          events.push({
            event_date: eventDate,
            name: artistName + "...",
            color: artistAlbum.color || "#3b82f6",
            txt_color: "#FFFFFF",
          });
        }
      }

      if (uniqueArtists.length > 2) {
        events.push({
          event_date: eventDate,
          name: `+${uniqueArtists.length - 2}`,
          color: "rgba(255, 255, 255, 0.04)",
          txt_color: "white",
        });
      }

      if (events.length > 0) {
        await supabase.from("events").insert(events);
      }
    }
  };

  const handleEventsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const data = rows.slice(1);

      const events = data.map((row) => {
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || null;
        });
        return {
          event_date: obj.event_date || obj.date,
          name: obj.name,
          txt_color: obj.txt_color || obj.text_color || "#000000",
          color: obj.color || obj.background_color || "#ffffff",
        };
      });

      const { error } = await supabase.from("events").insert(events);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Imported ${events.length} events`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log("=== FORM SUBMIT STARTED ===");
    console.log("Environment:", import.meta.env.MODE);
    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
    e.preventDefault();
    console.log("[Upload] Form submitted, starting validation...");

    if (!formData.release_date || !formData.title || !formData.artist) {
      console.log("[Upload] Validation failed - missing required fields");
      toast({
        title: "Error",
        description:
          "Please fill in required fields: release date, title, and artist",
        variant: "destructive",
      });
      return;
    }

    console.log("[Upload] Validation passed, preparing album data...");
    setSubmitting(true);
    let uploadedImageUrl: string | null = null;

    try {
      // Upload image if selected
      let imageUrl = formData.image;
      if (!formData.diamond_card && selectedImage) {
        uploadedImageUrl = await uploadImage(selectedImage, "albums");
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Get random color and cover
      const { color, cover } = getRandomColorAndCover();

      const album = {
        release_date: formData.release_date,
        title: formData.title,
        artist: formData.artist,
        dob: formData.release_date,
        age: null,
        color: color,
        cover: cover,
        image: formData.diamond_card ? null : imageUrl || null,
        diamond_card: formData.diamond_card,
        spotify: formData.spotify || null,
        apple: formData.apple || null,
        custom_link: formData.custom_link || null,
        custom_link_label: formData.custom_link_label || "Other",
        ranking: formData.ranking || null,
        certification: formData.certification || null,
        streams: formData.streams || null,
      };

      const { data: insertedAlbum, error } = await supabase
        .from("albums")
        .insert([album])
        .select()
        .single();

      if (error) throw error;

      console.log(
        "[Upload] Album inserted, triggering notification...",
        insertedAlbum,
      );

      // Send notification (non-blocking)
      if (insertedAlbum) {
        new NotificationClient()
          .sendAlbumNotification(insertedAlbum, "added")
          .then((result) => console.log("=== NOTIFICATION SUCCESS ===", result))
          .catch((err) => console.error("=== NOTIFICATION FAILED ===", err));
      }

      // Regenerate events for this date
      await regenerateEvents([formData.release_date]);

      toast({
        title: "Success",
        description: `Added album "${formData.title}" by ${formData.artist}`,
      });

      // Reset form
      setFormData({
        release_date: "",
        title: "",
        artist: "",
        image: "",
        diamond_card: false,
        spotify: "",
        apple: "",
        custom_link: "",
        custom_link_label: "YouTube",
        ranking: "",
        certification: "",
        streams: "",
      });
      setSelectedImage(null);
      setImagePreview("");
    } catch (error: any) {
      // If album insert failed and we uploaded an image, delete it
      if (uploadedImageUrl) {
        await deleteImage(uploadedImageUrl);
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Data</h1>
          <p className="text-muted-foreground">
            Import albums from CSV or add them individually
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Albums
              </CardTitle>
              <CardDescription>
                Select a CSV file to preview before uploading.{" "}
                <a
                  href="https://docs.google.com/spreadsheets/d/1pzBRfUlHIE7WmQ0ExPvhAMR4CQ2vLJy9-w7vsKaglzI/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View sample CSV
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="albums-file">Select CSV File</Label>
                  <Input
                    id="albums-file"
                    type="file"
                    accept=".csv"
                    onChange={handleAlbumsUpload}
                    disabled={uploading}
                  />
                </div>

                {selectedFile && previewData.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm font-medium mb-1">Selected File:</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {previewData.length} albums found
                      </p>
                    </div>

                    <div className="max-h-48 overflow-y-auto border rounded p-3">
                      <p className="text-xs font-semibold mb-2">
                        Preview (first 5):
                      </p>
                      {previewData.slice(0, 5).map((album, idx) => (
                        <div
                          key={idx}
                          className="text-xs py-1 border-b last:border-0"
                        >
                          <span className="font-medium">{album.title}</span> -{" "}
                          {album.artist} ({album.release_date})
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={confirmUpload}
                        disabled={uploading}
                        className="flex-1"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Confirm Upload"}
                      </Button>
                      <Button
                        onClick={cancelUpload}
                        disabled={uploading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Album Manually
              </CardTitle>
              <CardDescription>
                Add a single album to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="release_date">Release Date *</Label>
                    <Input
                      id="release_date"
                      type="date"
                      value={formData.release_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          release_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Album title"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) =>
                        setFormData({ ...formData, artist: e.target.value })
                      }
                      placeholder="Artist name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ranking">Ranking</Label>
                    <Input
                      id="ranking"
                      value={formData.ranking}
                      onChange={(e) =>
                        setFormData({ ...formData, ranking: e.target.value })
                      }
                      placeholder="#1, #2, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="certification">Certification</Label>
                    <Input
                      id="certification"
                      value={formData.certification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certification: e.target.value,
                        })
                      }
                      placeholder="Gold, Platinum, etc."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="streams">Streams</Label>
                    <Input
                      id="streams"
                      value={formData.streams}
                      onChange={(e) =>
                        setFormData({ ...formData, streams: e.target.value })
                      }
                      placeholder="1M, 500K, etc."
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex flex-1 items-start gap-3">
                          <Checkbox
                            id="diamond_card"
                            checked={formData.diamond_card}
                            onCheckedChange={(checked) => {
                              const isChecked = checked === true;
                              setFormData({
                                ...formData,
                                diamond_card: isChecked,
                                image: isChecked ? "" : formData.image,
                              });
                              if (isChecked) {
                                setSelectedImage(null);
                                setImagePreview("");
                              }
                            }}
                          />
                          <div className="space-y-2 leading-none">
                            <Label
                              htmlFor="diamond_card"
                              className="text-base font-semibold"
                            >
                              Diamond Album
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Turn this on to auto-generate the album card from
                              the title and release date. No image upload is
                              needed.
                            </p>
                            {formData.diamond_card && (
                              <p className="inline-flex rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700">
                                Generated card will be used on the calendar
                              </p>
                            )}
                          </div>
                        </div>
                        {formData.diamond_card && (
                          <div className="h-36 w-36 flex-shrink-0">
                            <DiamondAlbumCard
                              title={formData.title}
                              releaseDate={formData.release_date}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`col-span-2 ${
                      formData.diamond_card ? "opacity-50" : ""
                    }`}
                  >
                    <Label htmlFor="album-image">Upload Album Image</Label>
                    <Input
                      id="album-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={submitting || formData.diamond_card}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.diamond_card
                        ? "Disabled because Diamond Album uses the generated card."
                        : "Or enter URL below (max 5MB)"}
                    </p>
                  </div>
                  <div
                    className={`col-span-2 ${
                      formData.diamond_card ? "opacity-50" : ""
                    }`}
                  >
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://..."
                      disabled={!!selectedImage || formData.diamond_card}
                    />
                  </div>
                  <div>
                    <Label htmlFor="spotify">Spotify URL</Label>
                    <Input
                      id="spotify"
                      value={formData.spotify}
                      onChange={(e) =>
                        setFormData({ ...formData, spotify: e.target.value })
                      }
                      placeholder="https://open.spotify.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="apple">Apple Music URL</Label>
                    <Input
                      id="apple"
                      value={formData.apple}
                      onChange={(e) =>
                        setFormData({ ...formData, apple: e.target.value })
                      }
                      placeholder="https://music.apple.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom_link">Custom Link</Label>
                    <Input
                      id="custom_link"
                      value={formData.custom_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custom_link: e.target.value,
                        })
                      }
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom_link_label">Custom Link Label</Label>
                    <Input
                      id="custom_link_label"
                      value={formData.custom_link_label}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custom_link_label: e.target.value,
                        })
                      }
                      placeholder="YouTube, SoundCloud, etc."
                    />
                  </div>
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {submitting ? "Adding..." : "Add Album"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
            <CardDescription>
              Use this format when uploading albums via CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Required Fields:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">
                      release_date
                    </span>{" "}
                    - Album release date (YYYY-MM-DD format)
                  </li>
                  <li>
                    <span className="font-medium text-foreground">title</span> -
                    Album title
                  </li>
                  <li>
                    <span className="font-medium text-foreground">artist</span>{" "}
                    - Artist name
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Optional Fields:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">ranking</span>{" "}
                    - Chart position (e.g., #1, #2)
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      certification
                    </span>{" "}
                    - Gold, Platinum, Diamond, etc.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">streams</span>{" "}
                    - Number of streams (e.g., 1M, 500K)
                  </li>
                  <li>
                    <span className="font-medium text-foreground">image</span> -
                    Album cover image URL
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      diamond_card
                    </span>{" "}
                    - true/false, yes/no, or 1/0 to use the generated diamond
                    card
                  </li>
                  <li>
                    <span className="font-medium text-foreground">spotify</span>{" "}
                    - Spotify album URL
                  </li>
                  <li>
                    <span className="font-medium text-foreground">apple</span> -
                    Apple Music album URL
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      custom_link
                    </span>{" "}
                    - Custom link URL (e.g., YouTube, SoundCloud)
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      custom_link_label
                    </span>{" "}
                    - Label for custom link (e.g., "YouTube", "SoundCloud")
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Example CSV:</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`release_date,title,artist,ranking,certification,streams,image,diamond_card,spotify,apple,custom_link,custom_link_label
2025-01-15,Album Name,Artist Name,#1,Gold,1M,,true,https://open.spotify.com/...,https://music.apple.com/...,https://youtube.com/...,YouTube`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
