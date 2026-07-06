import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { thumbUrl } from "@/lib/imageUtils";
import { LazyImage } from "@/components/ui/LazyImage";
import { DiamondAlbumCard } from "@/components/DiamondAlbumCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Album } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

const PAGE_SIZE = 20;

function getPageNumbers(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (page > 3) pages.push("ellipsis");
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  ) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

function AlbumCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("albums_page");
    return saved ? parseInt(saved) : 1;
  });
  const [search, setSearch] = useState(() => {
    return sessionStorage.getItem("albums_search") || "";
  });
  const [searchInput, setSearchInput] = useState(() => {
    return sessionStorage.getItem("albums_search") || "";
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  // Save page and search to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("albums_page", page.toString());
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem("albums_search", search);
  }, [search]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Force refresh when navigating back from delete
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    let cancelled = false;
    async function fetchAlbums() {
      setLoading(true);
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("albums")
        .select("*", { count: "exact" })
        .order("release_date")
        .range(from, to);

      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,artist.ilike.%${search.trim()}%`,
        );
      }

      const { data, error, count } = await query;

      if (!cancelled) {
        if (!error) {
          setAlbums(data || []);
          setTotal(count ?? 0);
        }
        setLoading(false);
      }
    }
    fetchAlbums();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeFrom = (page - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(page * PAGE_SIZE, total);

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
          <p className="text-sm text-muted-foreground mt-0.5 h-5">
            {!loading && (
              <>
                {total.toLocaleString()} album{total !== 1 ? "s" : ""}
                {search ? ` matching "${search}"` : ""}
              </>
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title or artist…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Album grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
        {loading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))
        ) : albums.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <p className="text-muted-foreground">
              {search ? `No albums found for "${search}"` : "No albums found."}
            </p>
          </div>
        ) : (
          albums.map((a) => (
            <div
              key={a.id}
              className="group cursor-pointer"
              onClick={() =>
                navigate(`/albums/${a.id}`, {
                  state: { from: "albums", page, search },
                })
              }
            >
              {/* Cover art */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {a.diamond_card ? (
                  <DiamondAlbumCard
                    title={a.title}
                    releaseDate={a.release_date}
                  />
                ) : a.image ? (
                  <LazyImage
                    src={thumbUrl(a.image, 400)}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: a.color || "#1a1a2e" }}
                  >
                    <span className="text-4xl font-bold text-white/20 select-none">
                      {a.title?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                {/* Bottom color strip */}
                {a.color && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: a.color }}
                  />
                )}

                {/* Ranking badge */}
                {a.ranking && (
                  <Badge className="absolute top-2 right-2 text-[10px] px-1.5 py-0 bg-black/60 hover:bg-black/60 text-white border-0 backdrop-blur-sm font-normal">
                    {a.ranking}
                  </Badge>
                )}
              </div>

              {/* Text info */}
              <div className="mt-2.5 space-y-0.5 min-w-0">
                <p className="text-sm font-medium truncate leading-snug">
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {a.artist}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination footer */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-5">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing{" "}
            <span className="font-medium text-foreground">
              {rangeFrom.toLocaleString()}–{rangeTo.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {total.toLocaleString()}
            </span>{" "}
            albums
          </p>

          <Pagination className="w-auto mx-0 order-1 sm:order-2">
            <PaginationContent className="gap-0.5">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-40 cursor-default"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`el-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p as number)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-40 cursor-default"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </DashboardLayout>
  );
}
