import { useEffect, useState } from "react";
import {
  getNotificationMetrics,
  checkFailureRate,
  getRecentNotifications,
  getAllDeviceTokens,
  type NotificationMetrics,
  type FailureAlert,
  type NotificationLogEntry,
  type DeviceTokenInfo,
} from "@/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationAdmin() {
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [failureAlert, setFailureAlert] = useState<FailureAlert | null>(null);
  const [recentLogs, setRecentLogs] = useState<NotificationLogEntry[]>([]);
  const [devices, setDevices] = useState<DeviceTokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    setLoading(true);

    // Calculate date range
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString();
    const endDate = new Date().toISOString();

    // Load metrics
    const { data: metricsData } = await getNotificationMetrics({
      start_date: startDate,
      end_date: endDate,
    });
    setMetrics(metricsData);

    // Check failure rate
    const { data: alertData } = await checkFailureRate(24);
    setFailureAlert(alertData);

    // Load recent notifications
    const { data: logsData } = await getRecentNotifications(50);
    setRecentLogs(logsData || []);

    // Load devices
    const { data: devicesData } = await getAllDeviceTokens();
    setDevices(devicesData || []);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Push Notifications Admin</h1>
          <p className="text-muted-foreground">
            Monitor notification delivery and device statistics
          </p>
        </div>
        <Button onClick={loadData}>Refresh</Button>
      </div>

      {/* Failure Alert */}
      {failureAlert?.alert_triggered && (
        <Alert variant="destructive">
          <AlertTitle>⚠️ High Failure Rate Detected</AlertTitle>
          <AlertDescription>{failureAlert.message}</AlertDescription>
        </Alert>
      )}

      {/* Date Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={dateRange === "7d" ? "default" : "outline"}
          onClick={() => setDateRange("7d")}
        >
          Last 7 Days
        </Button>
        <Button
          variant={dateRange === "30d" ? "default" : "outline"}
          onClick={() => setDateRange("30d")}
        >
          Last 30 Days
        </Button>
        <Button
          variant={dateRange === "90d" ? "default" : "outline"}
          onClick={() => setDateRange("90d")}
        >
          Last 90 Days
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_devices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.active_devices || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opted In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.opted_in_devices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.opted_out_devices || 0} opted out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.success_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.total_successes || 0} / {metrics?.total_recipients || 0}{" "}
              delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notifications Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_notifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.total_failures || 0} failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground">iOS Devices</p>
              <p className="text-2xl font-bold">{metrics?.ios_devices || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Android Devices</p>
              <p className="text-2xl font-bold">
                {metrics?.android_devices || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Recent Notifications</TabsTrigger>
          <TabsTrigger value="devices">Registered Devices</TabsTrigger>
        </TabsList>

        {/* Recent Notifications Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notification Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notifications sent yet
                  </p>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {log.album_title || "Unknown Album"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          by {log.album_artist || "Unknown Artist"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {log.recipient_count} recipients
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.success_count} ✓ / {log.failure_count} ✗
                          </p>
                        </div>
                        <Badge
                          variant={
                            log.failure_count === 0 ? "default" : "destructive"
                          }
                        >
                          {log.failure_count === 0 ? "Success" : "Has Failures"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registered Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {devices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No devices registered yet
                  </p>
                ) : (
                  devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">
                          {device.device_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Registered:{" "}
                          {new Date(device.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last used:{" "}
                          {new Date(device.last_used_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">{device.platform}</Badge>
                        <Badge
                          variant={device.is_active ? "default" : "secondary"}
                        >
                          {device.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge
                          variant={
                            device.notifications_enabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {device.notifications_enabled
                            ? "Opted In"
                            : "Opted Out"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
