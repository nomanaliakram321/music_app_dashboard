import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc3, FolderOpen, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function Dashboard() {
  const [stats, setStats] = useState({ events: 0, albums: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [albumsByMonth, setAlbumsByMonth] = useState<any[]>([]);
  const [albumsByArtist, setAlbumsByArtist] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const [events, albums, users] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("albums").select("id", { count: "exact", head: true }),
        supabase.from("app_users").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        events: events.count || 0,
        albums: albums.count || 0,
        users: users.count || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchChartData() {
      // Albums by month
      const { data: albums } = await supabase
        .from("albums_by_month_day")
        .select("month")
        .limit(1000);

      if (albums) {
        const monthCounts: Record<number, number> = {};
        albums.forEach((a) => {
          monthCounts[a.month] = (monthCounts[a.month] || 0) + 1;
        });

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthData = Object.entries(monthCounts)
          .map(([month, count]) => ({
            month: monthNames[parseInt(month) - 1],
            albums: count,
          }))
          .sort(
            (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month),
          );

        setAlbumsByMonth(monthData);
      }

      // Top artists
      const { data: allAlbums } = await supabase
        .from("albums")
        .select("artist")
        .limit(1000);

      if (allAlbums) {
        const artistCounts: Record<string, number> = {};
        allAlbums.forEach((a) => {
          artistCounts[a.artist] = (artistCounts[a.artist] || 0) + 1;
        });

        const topArtists = Object.entries(artistCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([artist, count]) => ({ artist, albums: count }));

        setAlbumsByArtist(topArtists);
      }

      // Recent albums
      const { data: recent } = await supabase
        .from("albums")
        .select("title, artist, release_date")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentAlbums(recent || []);
    }
    fetchChartData();
  }, []);

  const cards = [
    {
      title: "Total Events",
      value: stats.events,
      icon: FolderOpen,
      color: "text-blue-500",
    },
    {
      title: "Total Albums",
      value: stats.albums,
      icon: Disc3,
      color: "text-purple-500",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      color: "text-green-500",
    },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.title}
                </CardTitle>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-bold">
                    {c.value.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Albums by Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Albums by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {albumsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={albumsByMonth}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="albums"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-[300px] w-full" />
              )}
            </CardContent>
          </Card>

          {/* Top Artists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top 5 Artists
              </CardTitle>
            </CardHeader>
            <CardContent>
              {albumsByArtist.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={albumsByArtist} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      dataKey="artist"
                      type="category"
                      width={100}
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="albums"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-[300px] w-full" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Albums */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc3 className="h-5 w-5" />
              Recently Added Albums
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlbums.length > 0 ? (
              <div className="space-y-3">
                {recentAlbums.map((album, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{album.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {album.artist}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(album.release_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
