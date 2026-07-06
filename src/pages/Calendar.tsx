import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { thumbUrl } from "@/lib/imageUtils";
import { LazyImage } from "@/components/ui/LazyImage";
import { DiamondAlbumCard } from "@/components/DiamondAlbumCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Album } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

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
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sortDiamondAlbumsFirst(albums: Album[]) {
  return [...albums].sort((a, b) => {
    if (a.diamond_card !== b.diamond_card) {
      return a.diamond_card ? -1 : 1;
    }

    return (a.artist || "").localeCompare(b.artist || "");
  });
}

function removeDuplicateAlbums(albums: Album[]) {
  const seen = new Set<string>();

  return albums.filter((album) => {
    if (seen.has(album.title)) {
      return false;
    }
    seen.add(album.title);
    return true;
  });
}

async function fetchCalendarAlbums(month: number, day?: number) {
  let query = supabase
    .from("albums_by_month_day")
    .select("*")
    .eq("month", month)
    .order("artist");

  if (day !== undefined) {
    query = query.eq("day", day);
  }

  const { data: calendarRows, error: calendarError } = await query;
  if (calendarError || !calendarRows?.length) {
    return { albums: [], error: calendarError };
  }

  const { data: diamondAlbums, error: diamondError } = await supabase
    .from("albums")
    .select("id")
    .eq("diamond_card", true);

  if (diamondError) {
    return { albums: calendarRows, error: null };
  }

  const diamondAlbumIds = new Set((diamondAlbums || []).map((album) => album.id));
  const albums = calendarRows.map((album) => ({
    ...album,
    diamond_card: album.diamond_card || diamondAlbumIds.has(album.id),
  }));

  return { albums, error: null };
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as {
    month?: number;
    refresh?: number;
  } | null;

  const [month, setMonth] = useState(() => {
    // Restore month from navigation state or sessionStorage
    if (navigationState?.month !== undefined) {
      return navigationState.month;
    }
    const saved = sessionStorage.getItem("calendar_month");
    return saved ? parseInt(saved) : 0;
  });
  const [year] = useState(2025);
  const [albumsByDay, setAlbumsByDay] = useState<Record<number, Album[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const nonDupAlbums = useMemo(() => removeDuplicateAlbums(albums), [albums]);

  // Save month to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("calendar_month", month.toString());
  }, [month]);

  // Handle refresh from navigation state
  useEffect(() => {
    if (navigationState?.refresh) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [navigationState?.refresh]);

  useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      try {
        const { albums, error } = await fetchCalendarAlbums(month + 1);

        if (error) {
          setAlbumsByDay({});
        } else {
          const grouped: Record<number, Album[]> = {};
          albums
            .filter((album) => album.title?.trim() || album.artist?.trim())
            .forEach((album) => {
              const day = album.day;
              if (!grouped[day]) grouped[day] = [];
              grouped[day].push(album);
            });
          setAlbumsByDay(grouped);
        }
      } catch (err) {
        setAlbumsByDay({});
      }
      setLoading(false);
    }
    fetchAlbums();
  }, [month, refreshKey]);

  // Refresh when page becomes visible (e.g., after navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setRefreshKey((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month > 0) {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month < 11) {
      setMonth((m) => m + 1);
    }
  };

  const handleDayClick = async (day: number) => {
    setSelectedDay(day);
    setLoadingAlbums(true);
    try {
      const { albums, error } = await fetchCalendarAlbums(month + 1, day);

      if (error) {
        setAlbums([]);
      } else {
        const uniqueAlbums = Array.from(
          new Map(albums.map((album) => [album.id, album])).values(),
        );
        setAlbums(sortDiamondAlbumsFirst(uniqueAlbums));
      }
    } catch (err) {
      setAlbums([]);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleAlbumClick = (albumId: string) => {
    setSelectedDay(null);
    setAlbums([]);
    navigate(`/albums/${albumId}`, {
      state: { from: "calendar", month, day: selectedDay },
    });
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              disabled={month === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[180px] text-center">
              {MONTH_NAMES[month]}
              {/* {year} */}
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
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : (
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-card p-2 min-h-[100px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAlbums = sortDiamondAlbumsFirst(albumsByDay[day] || []);
              const diamondAlbums = dayAlbums.filter(
                (album) => album.diamond_card,
              );
              const displayAlbums = diamondAlbums.slice(0, 2);
              const remainingAlbumCount = Math.max(
                dayAlbums.length - displayAlbums.length,
                0,
              );
              const hasDiamondAlbums = diamondAlbums.length > 0;

              return (
                <div
                  key={day}
                  className="bg-card p-2 min-h-[100px] cursor-pointer hover:bg-accent/50 transition-colors flex flex-col"
                  onClick={() => handleDayClick(day)}
                >
                  <span className="text-sm font-medium mb-1">{day}</span>
                  <div className="flex-1 space-y-1">
                    {displayAlbums.map((album) => (
                      <div key={album.id} className="h-9 w-full">
                        <DiamondAlbumCard
                          title={
                            album.title?.trim() ||
                            album.artist?.trim() ||
                            "Unknown"
                          }
                          releaseDate={album.release_date}
                          compact
                          className="aspect-auto rounded px-2 py-1"
                        />
                      </div>
                    ))}
                    {!hasDiamondAlbums && dayAlbums.length > 0 && (
                      <div className="flex h-full min-h-[54px] items-center justify-center">
                        <div className="rounded-md border border-dashed border-border bg-muted/40 px-2.5 py-1.5 text-center text-xs font-medium text-muted-foreground">
                          {dayAlbums.length}{" "}
                          {dayAlbums.length === 1 ? "album" : "albums"}
                        </div>
                      </div>
                    )}
                  </div>
                  {hasDiamondAlbums && remainingAlbumCount > 0 && (
                    <div className="text-xs px-1.5 py-0.5 rounded truncate font-medium mt-1 bg-muted/50">
                      +{remainingAlbumCount} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Day Albums Dialog */}
        <Dialog
          open={selectedDay !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDay(null);
              setAlbums([]);
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {MONTH_NAMES[month]} {selectedDay}, {year}
              </DialogTitle>
            </DialogHeader>
            {loadingAlbums ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : albums.length === 0 ? (
              <p className="text-muted-foreground">No albums on this day.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {nonDupAlbums.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleAlbumClick(a.id)}
                  >
                    {a.diamond_card ? (
                      <div className="h-14 w-14 flex-shrink-0">
                        <DiamondAlbumCard
                          title={a.title}
                          releaseDate={a.release_date}
                          compact
                          className="rounded"
                        />
                      </div>
                    ) : (
                      a.image?.startsWith("http") && (
                        <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0">
                          <LazyImage
                            src={thumbUrl(a.image, 112)}
                            alt={a.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
