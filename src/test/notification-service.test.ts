import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationService } from "@/lib/notification-service";
import { FCMService } from "@/lib/fcm";
import { supabase } from "@/lib/supabase";
import type { Album, DeviceToken } from "@/types/database";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock FCM Service
vi.mock("@/lib/fcm", () => {
  const mockFCMService = {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: vi.fn().mockReturnValue(true),
    sendToDevice: vi.fn(),
    sendToMultipleDevices: vi.fn(),
  };

  return {
    FCMService: vi.fn(() => mockFCMService),
  };
});

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockFCMService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFCMService = new FCMService();
    notificationService = new NotificationService(mockFCMService);
  });

  describe("getActiveTokens", () => {
    it("should query and return active device tokens with notifications enabled", async () => {
      const mockTokens: DeviceToken[] = [
        {
          id: "token-1",
          user_id: "user-1",
          device_id: "device-1",
          fcm_token: "fcm-token-1",
          platform: "ios",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "token-2",
          user_id: "user-2",
          device_id: "device-2",
          fcm_token: "fcm-token-2",
          platform: "android",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      // First eq call for is_active
      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      });

      const result = await notificationService.getActiveTokens();

      expect(result).toEqual(mockTokens);
      expect(supabase.from).toHaveBeenCalledWith("device_tokens");
      expect(mockSelect).toHaveBeenCalledWith("*");
    });

    it("should return empty array when no active tokens found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await notificationService.getActiveTokens();

      expect(result).toEqual([]);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      });

      await expect(notificationService.getActiveTokens()).rejects.toThrow(
        "Database query failed",
      );
    });
  });

  describe("sendAlbumNotification", () => {
    const mockAlbum: Album = {
      id: "album-123",
      title: "Test Album",
      artist: "Test Artist",
      release_date: "2024-01-01",
      image: "https://example.com/cover.jpg",
      cover: "cover.jpg",
      color: "#000000",
      dob: "2024-01-01",
      age: "0",
      ranking: null,
      certification: null,
      streams: null,
      spotify: null,
      apple: null,
      custom_link: null,
      custom_link_label: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    it("should send notifications to all active tokens successfully", async () => {
      const mockTokens: DeviceToken[] = [
        {
          id: "token-1",
          user_id: "user-1",
          device_id: "device-1",
          fcm_token: "fcm-token-1",
          platform: "ios",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "token-2",
          user_id: "user-2",
          device_id: "device-2",
          fcm_token: "fcm-token-2",
          platform: "android",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock getActiveTokens
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
          };
        }
        if (table === "notification_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      });

      // Mock FCM batch response
      mockFCMService.sendToMultipleDevices.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [
          { success: true, messageId: "msg-1" },
          { success: true, messageId: "msg-2" },
        ],
      });

      const result = await notificationService.sendAlbumNotification(mockAlbum);

      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle no active tokens gracefully", async () => {
      // Mock getActiveTokens returning empty array
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
          };
        }
        if (table === "notification_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await notificationService.sendAlbumNotification(mockAlbum);

      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(mockFCMService.sendToMultipleDevices).not.toHaveBeenCalled();
    });

    it("should mark invalid tokens as inactive", async () => {
      const mockTokens: DeviceToken[] = [
        {
          id: "token-1",
          user_id: "user-1",
          device_id: "device-1",
          fcm_token: "fcm-token-1",
          platform: "ios",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock getActiveTokens
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi
        .fn()
        .mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        if (table === "notification_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      });

      // Mock FCM response with invalid token error
      mockFCMService.sendToMultipleDevices.mockResolvedValue({
        successCount: 0,
        failureCount: 1,
        responses: [
          {
            success: false,
            error: {
              code: "messaging/invalid-registration-token",
              message: "Invalid token",
            },
          },
        ],
      });

      const result = await notificationService.sendAlbumNotification(mockAlbum);

      expect(result.success).toBe(true);
      expect(result.failureCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errorCode).toBe(
        "messaging/invalid-registration-token",
      );
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should construct correct notification payload", async () => {
      const mockTokens: DeviceToken[] = [
        {
          id: "token-1",
          user_id: "user-1",
          device_id: "device-1",
          fcm_token: "fcm-token-1",
          platform: "ios",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock getActiveTokens
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
          };
        }
        if (table === "notification_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      });

      mockFCMService.sendToMultipleDevices.mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        responses: [{ success: true, messageId: "msg-1" }],
      });

      await notificationService.sendAlbumNotification(mockAlbum);

      expect(mockFCMService.sendToMultipleDevices).toHaveBeenCalledWith(
        ["fcm-token-1"],
        expect.objectContaining({
          notification: {
            title: `New Album: ${mockAlbum.title}`,
            body: `by ${mockAlbum.artist}`,
            image: mockAlbum.image,
          },
          data: {
            albumId: mockAlbum.id,
            artist: mockAlbum.artist,
            type: "album_added",
          },
          android: {
            priority: "high",
            notification: {
              channelId: "album_updates",
              sound: "default",
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
                badge: 1,
              },
            },
          },
        }),
      );
    });

    it("should log notification results", async () => {
      const mockTokens: DeviceToken[] = [
        {
          id: "token-1",
          user_id: "user-1",
          device_id: "device-1",
          fcm_token: "fcm-token-1",
          platform: "ios",
          is_active: true,
          notifications_enabled: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          last_used_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock getActiveTokens
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
          };
        }
        if (table === "notification_logs") {
          return {
            insert: mockInsert,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      });

      mockFCMService.sendToMultipleDevices.mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        responses: [{ success: true, messageId: "msg-1" }],
      });

      await notificationService.sendAlbumNotification(mockAlbum);

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          album_id: mockAlbum.id,
          notification_type: "album_added",
          recipient_count: 1,
          success_count: 1,
          failure_count: 0,
        }),
      ]);
    });
  });

  describe("updateTokenStatus", () => {
    it("should update token active status to false", async () => {
      const tokenId = "token-123";
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      await notificationService.updateTokenStatus(tokenId, false);

      expect(supabase.from).toHaveBeenCalledWith("device_tokens");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
        }),
      );
    });

    it("should update token active status to true", async () => {
      const tokenId = "token-456";
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      await notificationService.updateTokenStatus(tokenId, true);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: true,
        }),
      );
    });

    it("should throw error when database update fails", async () => {
      const tokenId = "token-789";
      const dbError = new Error("Update failed");

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: dbError });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      await expect(
        notificationService.updateTokenStatus(tokenId, false),
      ).rejects.toThrow("Failed to update token status");
    });
  });

  describe("logNotification", () => {
    it("should insert notification log into database", async () => {
      const mockLog = {
        album_id: "album-123",
        notification_type: "album_added",
        recipient_count: 5,
        success_count: 4,
        failure_count: 1,
        payload: {
          notification: {
            title: "New Album: Test",
            body: "by Artist",
          },
        },
      };

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await notificationService.logNotification(mockLog);

      expect(supabase.from).toHaveBeenCalledWith("notification_logs");
      expect(mockInsert).toHaveBeenCalledWith([mockLog]);
    });

    it("should throw error when logging fails", async () => {
      const mockLog = {
        album_id: "album-123",
        notification_type: "album_added",
        recipient_count: 5,
        success_count: 4,
        failure_count: 1,
        payload: {},
      };

      const dbError = new Error("Insert failed");
      const mockInsert = vi
        .fn()
        .mockResolvedValue({ data: null, error: dbError });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await expect(
        notificationService.logNotification(mockLog),
      ).rejects.toThrow("Failed to log notification");
    });
  });
});
