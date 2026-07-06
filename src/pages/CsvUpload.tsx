import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { NotificationClient } from "@/lib/notification-client";

export default function CsvUpload() {
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">CSV Upload</h1>
      <Tabs defaultValue="albums">
        <TabsList>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="albums">
          <AlbumsCsvUpload toast={toast} />
        </TabsContent>
        <TabsContent value="events">
          <EventsCsvUpload toast={toast} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function AlbumsCsvUpload({
  toast,
}: {
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setErrors([]);
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setHeaders(result.meta.fields || []);
        setRows(result.data as Record<string, string>[]);
      },
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    const validationErrors: string[] = [];

    const mapped = rows
      .filter((r) => r.title || r.name)
      .map((row, i) => {
        const releaseDate = row.date || row.release_date;
        if (releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
          validationErrors.push(
            `Row ${i + 1}: invalid date format "${releaseDate}"`,
          );
        }

        return {
          title: row.title || row.name,
          artist: row.artist || "",
          release_date: releaseDate,
          image: row.image || "",
          diamond_card:
            row.diamond_card === "true" ||
            row.diamond_card === "1" ||
            row.diamond_card === "yes",
          cover: row.cover || "",
          color: row.color || "",
          dob: row.dob || "",
          age: row.age || "",
          ranking: row.ranking || null,
          certification: row.certification || null,
          streams: row.streams || null,
          spotify: row.spotify || null,
          apple: row.apple || null,
        };
      });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setUploading(false);
      return;
    }

    const { data: insertedAlbums, error } = await supabase
      .from("albums")
      .insert(mapped)
      .select();
    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${mapped.length} albums imported.`,
      });

      // Trigger notifications for each album (non-blocking)
      if (insertedAlbums && insertedAlbums.length > 0) {
        console.log(`=== SENDING ${insertedAlbums.length} NOTIFICATIONS ===`);
        const notificationClient = new NotificationClient();
        insertedAlbums.forEach((album) => {
          notificationClient
            .sendAlbumNotification(album, "added")
            .then((result) =>
              console.log("=== NOTIFICATION SUCCESS ===", album.title, result),
            )
            .catch((notificationError) => {
              console.error(
                "=== NOTIFICATION FAILED ===",
                album.title,
                notificationError,
              );
            });
        });
      }

      setRows([]);
      setHeaders([]);
      setFile(null);
    }
    setUploading(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Albums CSV Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="h-4 w-4" />
          <span className="text-sm">
            {file ? file.name : "Choose CSV file"}
          </span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        {errors.length > 0 && (
          <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive space-y-1">
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              Preview (first 5 rows of {rows.length}):
            </p>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((r, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => (
                        <TableCell key={h}>{r[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : `Import ${rows.length} Albums`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EventsCsvUpload({
  toast,
}: {
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setHeaders(result.meta.fields || []);
        setRows(result.data as Record<string, string>[]);
      },
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    const mapped = rows
      .filter((r) => r.name)
      .map((row) => ({
        name: row.name,
        event_date: row.event_date,
        txt_color: row.txt_color || "#FFFFFF",
        color: row.background_color || row.color || "#000000",
      }));

    const { error } = await supabase.from("events").insert(mapped);
    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${mapped.length} events imported.`,
      });
      setRows([]);
      setHeaders([]);
      setFile(null);
    }
    setUploading(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Events CSV Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="h-4 w-4" />
          <span className="text-sm">
            {file ? file.name : "Choose CSV file"}
          </span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        {rows.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              Preview (first 5 rows of {rows.length}):
            </p>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((r, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => (
                        <TableCell key={h}>{r[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : `Import ${rows.length} Events`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
