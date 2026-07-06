import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const OLD_SUPABASE_HOSTS = ["https://eqwromenzktewzvimljl.supabase.co"];
const URL_COLUMNS = ["image", "cover", "spotify", "apple", "custom_link"] as const;
const ALBUM_CHILD_TABLES = [
  "stats_queue",
  "tracks",
  "certificates",
  "notification_logs",
] as const;
const BATCH_SIZE = 100;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or Supabase key in environment");
}

const supabase = createClient(supabaseUrl, supabaseKey);

type AlbumLinkRow = {
  id: string;
} & Partial<Record<(typeof URL_COLUMNS)[number], string | null>>;

function repairUrl(value: string | null | undefined) {
  if (!value) return value;

  return OLD_SUPABASE_HOSTS.reduce(
    (current, oldHost) => current.replaceAll(oldHost, supabaseUrl),
    value,
  );
}

async function fetchAllRows<T extends { id: string }>(
  table: string,
  select: string,
) {
  const rows: T[] = [];

  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + 999);

    if (error) throw error;
    if (!data?.length) break;

    rows.push(...(data as T[]));
    if (data.length < 1000) break;
  }

  return rows;
}

async function repairAlbumUrls() {
  const albums = await fetchAllRows<AlbumLinkRow>(
    "albums",
    `id, ${URL_COLUMNS.join(", ")}`,
  );

  let scanned = 0;
  let repaired = 0;

  for (const album of albums) {
    scanned++;

    const patch = URL_COLUMNS.reduce<Record<string, string | null>>(
      (changes, column) => {
        const current = album[column];
        const next = repairUrl(current);

        if (next !== current) {
          changes[column] = next ?? null;
        }

        return changes;
      },
      {},
    );

    if (Object.keys(patch).length === 0) continue;

    const { error } = await supabase.from("albums").update(patch).eq("id", album.id);
    if (error) throw error;
    repaired++;
  }

  return { scanned, repaired };
}

async function getAlbumIds() {
  const albums = await fetchAllRows<{ id: string }>("albums", "id");
  return new Set(albums.map((album) => album.id));
}

async function deleteOrphanRows(table: string, albumIds: Set<string>) {
  const { data, error } = await supabase.from(table).select("id, album_id");

  if (error) {
    console.warn(`[repair-db-links] Skipped ${table}: ${error.message}`);
    return { table, scanned: 0, removed: 0, skipped: true };
  }

  const orphanIds = (data || [])
    .filter((row) => row.album_id && !albumIds.has(row.album_id))
    .map((row) => row.id);

  for (let index = 0; index < orphanIds.length; index += BATCH_SIZE) {
    const batch = orphanIds.slice(index, index + BATCH_SIZE);
    const { error: deleteError } = await supabase.from(table).delete().in("id", batch);
    if (deleteError) throw deleteError;
  }

  return {
    table,
    scanned: data?.length || 0,
    removed: orphanIds.length,
    skipped: false,
  };
}

async function verifyNoOldHostsRemain() {
  const albums = await fetchAllRows<AlbumLinkRow>(
    "albums",
    `id, ${URL_COLUMNS.join(", ")}`,
  );

  return albums.filter((album) =>
    URL_COLUMNS.some((column) =>
      OLD_SUPABASE_HOSTS.some((oldHost) => album[column]?.includes(oldHost)),
    ),
  ).length;
}

async function verifyNoOrphansRemain(table: string, albumIds: Set<string>) {
  const { data, error } = await supabase.from(table).select("id, album_id");

  if (error) return { table, remaining: 0, skipped: true };

  return {
    table,
    remaining: (data || []).filter((row) => row.album_id && !albumIds.has(row.album_id))
      .length,
    skipped: false,
  };
}

async function main() {
  console.log("[repair-db-links] Starting bulk repair");

  const urlSummary = await repairAlbumUrls();
  const albumIds = await getAlbumIds();
  const orphanSummaries = [];

  for (const table of ALBUM_CHILD_TABLES) {
    orphanSummaries.push(await deleteOrphanRows(table, albumIds));
  }

  const remainingOldHostRows = await verifyNoOldHostsRemain();
  const refreshedAlbumIds = await getAlbumIds();
  const orphanVerification = [];

  for (const table of ALBUM_CHILD_TABLES) {
    orphanVerification.push(await verifyNoOrphansRemain(table, refreshedAlbumIds));
  }

  console.log(
    JSON.stringify(
      {
        albumUrlRepair: urlSummary,
        orphanRepair: orphanSummaries,
        verification: {
          remainingOldHostRows,
          orphanedRows: orphanVerification,
        },
      },
      null,
      2,
    ),
  );

  if (
    remainingOldHostRows > 0 ||
    orphanVerification.some((result) => !result.skipped && result.remaining > 0)
  ) {
    throw new Error("Database link verification failed");
  }
}

main().catch((error) => {
  console.error("[repair-db-links] Failed:", error.message);
  process.exit(1);
});
