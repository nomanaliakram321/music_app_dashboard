import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Event, Album } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        console.log("Fetching event with ID:", id);

        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("event_id", id)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError);
        } else {
          console.log("Event data:", eventData);
          setEvent(eventData);
        }

        const { data: albumsData, error: albumsError } = await supabase
          .from("albums")
          .select("*")
          .eq("event_id", id)
          .order("display_order");

        if (albumsError) {
          console.error("Error fetching albums:", albumsError);
        } else {
          console.log("Albums data:", albumsData);
          setAlbums(albumsData || []);
        }
      } catch (err) {
        console.error("Exception:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Event not found.</p>
          <Button onClick={() => navigate("/calendar")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Calendar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Button
        variant="ghost"
        onClick={() => navigate("/calendar")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Calendar
      </Button>

      <div className="mb-8">
        {event.cover_image_url && (
          <img
            src={event.cover_image_url}
            alt={event.name}
            className="w-full h-64 rounded-lg object-cover mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
        <p className="text-muted-foreground mb-4">{event.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            <span className="text-muted-foreground">Date: </span>
            {event.event_date}
          </span>
          <span>
            <span className="text-muted-foreground">Status: </span>
            <span className="capitalize">{event.status}</span>
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Albums</h2>
        {albums.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No albums for this event.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((a) => (
              <Card
                key={a.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() =>
                  navigate(`/albums/${a.id}`, {
                    state: { from: "events" },
                  })
                }
              >
                {a.cover_image_url && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={a.cover_image_url}
                      alt={a.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{a.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>📷 {a.total_photos}</span>
                    <span>🎥 {a.total_videos}</span>
                    <span className="ml-auto text-xs">{a.release_date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
