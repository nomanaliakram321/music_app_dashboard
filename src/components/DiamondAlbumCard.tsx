import { cn } from "@/lib/utils";

interface DiamondAlbumCardProps {
  title: string;
  releaseDate?: string | null;
  className?: string;
  compact?: boolean;
}

function formatCardDate(releaseDate?: string | null, compact = false) {
  if (!releaseDate) return "";

  const [year, month, day] = releaseDate.split("-").map(Number);
  if (!year || !month || !day) return releaseDate;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(compact ? {} : { year: "numeric" }),
  }).format(new Date(year, month - 1, day));
}

export function DiamondAlbumCard({
  title,
  releaseDate,
  className,
  compact = false,
}: DiamondAlbumCardProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-square h-full w-full flex-col overflow-hidden rounded-lg border border-sky-300/40 bg-[#050816] shadow-sm",
        compact ? "p-2" : "p-4",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.28),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.95),rgba(2,6,23,1))]" />
      <div className="relative z-10 flex h-full flex-col">
        <p
          className={cn(
            "font-semibold uppercase tracking-[0.08em] text-white",
            compact ? "text-[10px]" : "text-sm",
          )}
        >
          {formatCardDate(releaseDate, compact)}
        </p>
        <div className="flex flex-1 items-center">
          <p
            className={cn(
              "line-clamp-4 font-black leading-tight text-[#2EA8FF]",
              compact ? "line-clamp-1 text-xs" : "text-2xl md:text-3xl",
            )}
          >
            {title || "Untitled Album"}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={cn(
            "leading-none drop-shadow-[0_0_10px_rgba(56,189,248,0.75)]",
            compact ? "text-sm" : "text-3xl",
          )}
        >
          {"\u{1F48E}"}
        </span>
      </div>
    </div>
  );
}
