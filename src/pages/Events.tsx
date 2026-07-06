import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { thumbUrl } from "@/lib/imageUtils";
import { LazyImage } from "@/components/ui/LazyImage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Album } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface EventRow {
  date: string;
  day: number;
  albumCount: number;
  artists: string[];
  colors: string[];
  images: string[];
}

export default function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as { month?: number } | null;

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    // Restore month from navigation state or default to 0
    return navigationState?.month !== undefined ? navigationState.month : 0;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data } = await supabase
        .from("albums_by_month_day")
        .select("*")
        .eq("month", month + 1)
        .order("day")
        .order("artist");

      if (data) {
        // Group albums by day
        const grouped: Record<number, Album[]> = {};
        data.forEach((album) => {
          if (!grouped[album.day]) grouped[album.day] = [];
          grouped[album.day].push(album);
        });

        // Create event rows
        const eventRows: EventRow[] = Object.entries(grouped).map(
          ([day, albums]) => {
            const uniqueArtists = [...new Set(albums.map((a) => a.artist))];
            return {
              date: albums[0].release_date,
              day: parseInt(day),
              albumCount: albums.length,
              artists: uniqueArtists.slice(0, 3),
              colors: albums.slice(0, 3).map((a) => a.color || "#3b82f6"),
              images: albums
                .slice(0, 3)
                .map((a) => a.image)
                .filter(Boolean),
            };
          },
        );

        setEvents(eventRows);
      }
      setLoading(false);
    }
    fetchEvents();
  }, [month]);

  const handleEventClick = async (day: number) => {
    setLoadingAlbums(true);
    setSelectedDate(`${MONTH_NAMES[month]} ${day}`);

    const { data } = await supabase
      .from("albums_by_month_day")
      .select("*")
      .eq("month", month + 1)
      .eq("day", day)
      .order("artist");

    setSelectedAlbums(data || []);
    setLoadingAlbums(false);
  };

  const prevMonth = () => {
    if (month > 0) setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month < 11) setMonth((m) => m + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events by Month</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              disabled={month === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[120px] text-center">
              {MONTH_NAMES[month]}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              disabled={month === 11}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Day</TableHead>
                  <TableHead className="w-32">Preview</TableHead>
                  <TableHead>Artists</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead className="w-32">Albums</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event.day}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleEventClick(event.day)}
                  >
                    <TableCell className="font-bold text-2xl">
                      {event.day}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {event.images.slice(0, 3).map((img, i) => (
                          <div key={i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-background flex-shrink-0">
                            <LazyImage
                              src={thumbUrl(img, 80)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {event.images.length === 0 && (
                          <div
                            className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: event.colors[0] }}
                          >
                            {event.artists[0]?.[0]}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {event.artists.map((artist, i) => (
                          <div key={i} className="text-sm">
                            {artist}
                          </div>
                        ))}
                        {event.albumCount > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{event.albumCount - 3} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {event.colors.slice(0, 5).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {event.albumCount}{" "}
                        {event.albumCount === 1 ? "album" : "albums"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-12"
                    >
                      No events found for {MONTH_NAMES[month]}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          Total: {events.length} event{events.length !== 1 ? "s" : ""} for{" "}
          {MONTH_NAMES[month]}
        </div>
      </div>

      {/* Albums Dialog */}
      <Dialog
        open={selectedDate !== null}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDate}</DialogTitle>
          </DialogHeader>
          {loadingAlbums ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {selectedAlbums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setSelectedDate(null);
                    navigate(`/albums/${album.id}`, {
                      state: { from: "events", month: month },
                    });
                  }}
                >
                  {album.image ? (
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <LazyImage
                        src={thumbUrl(album.image, 128)}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-16 h-16 rounded flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: album.color || "#3b82f6" }}
                    >
                      {album.title?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{album.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {album.artist}
                    </p>
                    {album.ranking && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {album.ranking}
                      </span>
                    )}
                  </div>
                  {album.certification && (
                    <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium">
                      {album.certification}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
