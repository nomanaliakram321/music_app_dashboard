import { describe, it, expect, beforeEach, vi } from "vitest";
import { unregisterDevice, UnregisterDeviceRequest } from "@/api/mobile";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Device Unregistration Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("unregisterDevice", () => {
    it("should mark device token as inactive for existing device", async () => {
      const request: UnregisterDeviceRequest = {
        device_id: "test-device-1",
      };

      const existingToken = {
        id: "token-id-123",
        device_id: request.device_id,
        fcm_token: "fcm-token-123",
        platform: "ios",
        user_id: null,
        is_active: true,
        notifications_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        last_used_at: "2024-01-01T00:00:00Z",
      };

      // Mock select query (existing token found)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: existingToken, error: null });

      // Mock update query
      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            update: mockUpdate,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      });

      mockUpdateEq.mockResolvedValue({ error: null });

      const result = await unregisterDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
        }),
      );
    });

    it("should return error when device_id is missing", async () => {
      const request = {
        device_id: "",
      };

      const result = await unregisterDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Missing required field");
    });

    it("should return error when device does not exist", async () => {
      const request: UnregisterDeviceRequest = {
        device_id: "non-existent-device",
      };

      // Mock select query (no device found)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const result = await unregisterDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Device not found");
    });

    it("should handle database errors gracefully", async () => {
      const request: UnregisterDeviceRequest = {
        device_id: "test-device-1",
      };

      const dbError = new Error("Database connection failed");

      // Mock select query to throw error
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: dbError });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const result = await unregisterDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should update updated_at timestamp when unregistering device", async () => {
      const request: UnregisterDeviceRequest = {
        device_id: "test-device-1",
      };

      const existingToken = {
        id: "token-id-123",
        device_id: request.device_id,
        fcm_token: "fcm-token-123",
        platform: "ios",
        user_id: null,
        is_active: true,
        notifications_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        last_used_at: "2024-01-01T00:00:00Z",
      };

      // Mock select query
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: existingToken, error: null });

      // Mock update query
      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            update: mockUpdate,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      });

      mockUpdateEq.mockResolvedValue({ error: null });

      const result = await unregisterDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        }),
      );
    });

    it("should handle update errors from database", async () => {
      const request: UnregisterDeviceRequest = {
        device_id: "test-device-1",
      };

      const existingToken = {
        id: "token-id-123",
        device_id: request.device_id,
        fcm_token: "fcm-token-123",
        platform: "ios",
        user_id: null,
        is_active: true,
        notifications_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        last_used_at: "2024-01-01T00:00:00Z",
      };

      const updateError = new Error("Update failed");

      // Mock select query
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: existingToken, error: null });

      // Mock update query with error
      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            update: mockUpdate,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      });

      mockUpdateEq.mockResolvedValue({ error: updateError });

      const result = await unregisterDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBe(updateError);
    });

    it("should handle logout scenario by marking token inactive", async () => {
      const request: UnregisterDeviceRequest = {
        device_id: "test-device-logout",
      };

      const existingToken = {
        id: "token-id-logout",
        device_id: request.device_id,
        fcm_token: "fcm-token-logout",
        platform: "android",
        user_id: "user-123",
        is_active: true,
        notifications_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        last_used_at: "2024-01-01T00:00:00Z",
      };

      // Mock select query
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: existingToken, error: null });

      // Mock update query
      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockReturnThis();

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            update: mockUpdate,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      });

      mockUpdateEq.mockResolvedValue({ error: null });

      const result = await unregisterDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
        }),
      );
    });
  });
});
