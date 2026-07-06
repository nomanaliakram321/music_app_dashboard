import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { uploadImage, deleteImage } from "@/lib/storage";
import { NotificationClient } from "@/lib/notification-client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Album, Track, Certificate } from "@/types/database";
import { LazyImage } from "@/components/ui/LazyImage";
import { DiamondAlbumCard } from "@/components/DiamondAlbumCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Get navigation state
  const navigationState = location.state as {
    from?: string;
    month?: number;
    day?: number;
    page?: number;
    search?: string;
  } | null;

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    release_date: "",
    image: "",
    diamond_card: false,
    spotify: "",
    apple: "",
    custom_link: "",
    custom_link_label: "",
    ranking: "",
    certification: "",
    streams: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchAlbum = async () => {
      // Try to fetch from Edge Function first (with stats refresh)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token =
          session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-album-stats`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ album_id: id }),
          },
        );

        if (response.ok) {
          const { album: data, source } = await response.json();
          const sourceLabel =
            source === "cached_queued"
              ? "DATABASE (cached)"
              : "GROQ AI (fresh)";
          console.log(`=== ALBUM STATS SOURCE: ${sourceLabel} ===`);
          if (data) {
            setAlbum(data);
            setFormData({
              title: data.title || "",
              artist: data.artist || "",
              release_date: data.release_date || "",
              image: data.image || "",
              diamond_card: data.diamond_card || false,
              spotify: data.spotify || "",
              apple: data.apple || "",
              custom_link: data.custom_link || "",
              custom_link_label: data.custom_link_label || "Other",
              ranking: data.ranking || "",
              certification: data.certification || "",
              streams: data.streams || "",
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error(
          "Edge Function failed, falling back to direct query:",
          err,
        );
      }

      // Fallback: Fetch album directly from database
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setLoading(false);
        return;
      }

      setAlbum(data);
      if (data) {
        setFormData({
          title: data.title || "",
          artist: data.artist || "",
          release_date: data.release_date || "",
          image: data.image || "",
          diamond_card: data.diamond_card || false,
          spotify: data.spotify || "",
          apple: data.apple || "",
          custom_link: data.custom_link || "",
          custom_link_label: data.custom_link_label || "Other",
          ranking: data.ranking || "",
          certification: data.certification || "",
          streams: data.streams || "",
        });
      }
      setLoading(false);
    };

    fetchAlbum();
  }, [id]);

  const handleBack = () => {
    if (navigationState?.from === "calendar") {
      // Navigate back to calendar with preserved month
      navigate("/calendar", {
        state: { month: navigationState.month },
      });
    } else if (navigationState?.from === "albums") {
      // Navigate back to albums with preserved page and search
      navigate("/albums", {
        state: { page: navigationState.page, search: navigationState.search },
      });
    } else if (navigationState?.from === "events") {
      // Navigate back to events page with preserved month
      navigate("/events", {
        state: { month: navigationState.month },
      });
    } else {
      // Default: go back to albums
      navigate("/albums");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setImagePreview(album?.image || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview("");
    if (album) {
      setFormData({
        title: album.title || "",
        artist: album.artist || "",
        release_date: album.release_date || "",
        image: album.image || "",
        diamond_card: album.diamond_card || false,
        spotify: album.spotify || "",
        apple: album.apple || "",
        custom_link: album.custom_link || "",
        custom_link_label: album.custom_link_label || "Other",
        ranking: album.ranking || "",
        certification: album.certification || "",
        streams: album.streams || "",
      });
    }
  };

  const handleSave = async () => {
    if (!id || !album) return;
    setSaving(true);
    let uploadedImageUrl: string | null = null;

    try {
      // Upload new image if selected
      let imageUrl = formData.image;
      if (!formData.diamond_card && selectedImage) {
        uploadedImageUrl = await uploadImage(selectedImage, "albums");
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
          // Delete old image if it exists and is from our storage
          if (album.image && album.image.includes("supabase.co/storage")) {
            await deleteImage(album.image);
          }
        } else {
          throw new Error("Failed to upload image");
        }
      }

      const updateData = {
        ...formData,
        image: formData.diamond_card ? null : imageUrl,
      };
      const { error } = await supabase
        .from("albums")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Regenerate events for the updated album's release date
      await regenerateEventsForDate(formData.release_date);

      const updatedAlbum = { ...album, ...updateData };
      setAlbum(updatedAlbum);
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview("");

      // Send notification (non-blocking)
      console.log("=== SENDING NOTIFICATION ===", updatedAlbum);
      new NotificationClient()
        .sendAlbumNotification(updatedAlbum, "updated")
        .then((result) => console.log("=== NOTIFICATION SUCCESS ===", result))
        .catch((err) => console.error("=== NOTIFICATION FAILED ===", err));

      toast({
        title: "Success",
        description: "Album updated and events refreshed successfully.",
      });
    } catch (error: any) {
      // If update failed and we uploaded a new image, delete it
      if (uploadedImageUrl) {
        await deleteImage(uploadedImageUrl);
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const regenerateEventsForDate = async (releaseDate: string) => {
    const [year, month, day] = releaseDate.split("-");

    // Get ALL albums for this month-day (across all years)
    const { data: albums } = await supabase
      .from("albums_by_month_day")
      .select("*")
      .eq("month", parseInt(month))
      .eq("day", parseInt(day))
      .order("artist");

    if (!albums || albums.length === 0) {
      // Delete existing events for this month-day if no albums
      const monthStr = month.toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");

      // Get all events and filter by month-day in JavaScript
      const { data: allEvents } = await supabase
        .from("events")
        .select("event_date");

      const eventsToDelete =
        allEvents?.filter((evt) => {
          const evtDate = evt.event_date;
          return evtDate.endsWith(`-${monthStr}-${dayStr}`);
        }) || [];

      for (const evt of eventsToDelete) {
        await supabase.from("events").delete().eq("event_date", evt.event_date);
      }
      return;
    }

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
        await supabase.from("events").delete().eq("event_date", evt.event_date);
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
  };

  const handleDelete = async () => {
    if (!id || !album) return;
    setDeleting(true);
    try {
      console.log("Attempting to delete album with ID:", id);

      const albumReleaseDate = album.release_date;

      const { data, error } = await supabase
        .from("albums")
        .delete()
        .eq("id", id)
        .select();

      console.log("Delete response:", { data, error });

      if (error) {
        console.error("Delete error details:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(
          "Album was not deleted. Check RLS policies in database.",
        );
      }

      // Regenerate events for the deleted album's release date
      await regenerateEventsForDate(albumReleaseDate);

      toast({
        title: "Success",
        description: "Album deleted and events updated successfully.",
      });

      setShowDeleteDialog(false);

      // Navigate back to where user came from
      if (navigationState?.from === "calendar") {
        navigate("/calendar", {
          replace: true,
          state: { month: navigationState.month, refresh: Date.now() },
        });
      } else {
        navigate("/albums", {
          replace: true,
          state: { refresh: Date.now() },
        });
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete album. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-64 w-full" />
      </DashboardLayout>
    );
  }

  if (!album) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Album not found.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {!isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {album.diamond_card ? (
            <div className="h-48 w-48 flex-shrink-0">
              <DiamondAlbumCard
                title={album.title}
                releaseDate={album.release_date}
              />
            </div>
          ) : (
            album.image && (
            <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
              <LazyImage
                src={album.image}
                alt={album.title}
                className="w-full h-full object-cover"
              />
            </div>
            )
          )}
          <div>
            <h1 className="text-2xl font-bold">{album.title}</h1>
            <p className="text-muted-foreground mt-1">{album.artist}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span>Released: {album.release_date}</span>
              {album.streams && <span>Streams: {album.streams}</span>}
              {album.certification && (
                <span>Certification: {album.certification}</span>
              )}
              {album.ranking && <span>Ranking: {album.ranking}</span>}
            </div>
            <div className="flex gap-3 mt-3">
              {album.spotify && (
                <a
                  href={album.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-500 hover:underline"
                >
                  Spotify
                </a>
              )}
              {album.apple && (
                <a
                  href={album.apple}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pink-500 hover:underline"
                >
                  Apple Music
                </a>
              )}
              {album.custom_link && (
                <a
                  href={album.custom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {album.custom_link_label || "Other"}
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Edit Album</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) =>
                  setFormData({ ...formData, artist: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
                onChange={(e) =>
                  setFormData({ ...formData, release_date: e.target.value })
                }
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
              />
            </div>
            <div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="diamond_card_edit"
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
                      htmlFor="diamond_card_edit"
                      className="text-base font-semibold"
                    >
                      Diamond Album
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-generate the album card from title and release date.
                    </p>
                    {formData.diamond_card && (
                      <p className="inline-flex rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700">
                        Manual image fields are disabled
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {formData.diamond_card && (
              <div>
                <div className="h-32 w-32">
                  <DiamondAlbumCard
                    title={formData.title}
                    releaseDate={formData.release_date}
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="certification">Certification</Label>
              <Input
                id="certification"
                value={formData.certification}
                onChange={(e) =>
                  setFormData({ ...formData, certification: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="album-image-edit">Upload Album Image</Label>
              <Input
                id="album-image-edit"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    toast({
                      title: "Error",
                      description: "Please select an image file",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    toast({
                      title: "Error",
                      description: "Image must be less than 5MB",
                      variant: "destructive",
                    });
                    return;
                  }

                  setSelectedImage(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                disabled={saving || formData.diamond_card}
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
                Or enter URL below (max 5MB)
              </p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
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
              />
            </div>
            <div>
              <Label htmlFor="streams">Streams</Label>
              <Input
                id="streams"
                value={formData.streams}
                onChange={(e) =>
                  setFormData({ ...formData, streams: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="custom_link">Custom Link</Label>
              <Input
                id="custom_link"
                value={formData.custom_link}
                onChange={(e) =>
                  setFormData({ ...formData, custom_link: e.target.value })
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
        </div>
      )}

      {tracks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Tracks</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.track_number}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    {Math.floor(t.duration / 60)}:
                    {String(t.duration % 60).padStart(2, "0")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {certificates.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{album?.title}" by {album?.artist}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
