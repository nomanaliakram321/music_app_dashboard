import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerDevice, RegisterDeviceRequest } from "@/api/mobile";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Device Registration Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerDevice", () => {
    it("should create new token for first-time device", async () => {
      const request: RegisterDeviceRequest = {
        device_id: "test-device-1",
        fcm_token: "fcm-token-123",
        platform: "ios",
      };

      const mockInsertData = {
        id: "token-id-123",
        device_id: request.device_id,
        fcm_token: request.fcm_token,
        platform: request.platform,
        user_id: null,
        is_active: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      // Mock select query (no existing token)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock insert query
      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockInsertSingle = vi
        .fn()
        .mockResolvedValue({ data: mockInsertData, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            insert: mockInsert,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect,
      });

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle,
      });

      const result = await registerDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.data?.token_id).toBe("token-id-123");
      expect(result.error).toBeNull();
    });

    it("should update existing token for known device", async () => {
      const request: RegisterDeviceRequest = {
        device_id: "test-device-1",
        fcm_token: "new-fcm-token-456",
        platform: "android",
      };

      const existingToken = {
        id: "existing-token-id",
        device_id: request.device_id,
        fcm_token: "old-fcm-token",
        platform: "ios",
        user_id: null,
        is_active: false,
        notifications_enabled: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        last_used_at: "2024-01-01T00:00:00Z",
      };

      const updatedToken = {
        ...existingToken,
        fcm_token: request.fcm_token,
        platform: request.platform,
        is_active: true,
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
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
      const mockUpdateSelect = vi.fn().mockReturnThis();
      const mockUpdateSingle = vi
        .fn()
        .mockResolvedValue({ data: updatedToken, error: null });

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

      mockUpdateEq.mockReturnValue({
        select: mockUpdateSelect,
      });

      mockUpdateSelect.mockReturnValue({
        single: mockUpdateSingle,
      });

      const result = await registerDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.data?.token_id).toBe("existing-token-id");
      expect(result.error).toBeNull();
    });

    it("should associate token with user when user_id provided", async () => {
      const request: RegisterDeviceRequest = {
        device_id: "test-device-2",
        fcm_token: "fcm-token-789",
        platform: "ios",
        user_id: "user-123",
      };

      const mockInsertData = {
        id: "token-id-456",
        device_id: request.device_id,
        fcm_token: request.fcm_token,
        platform: request.platform,
        user_id: request.user_id,
        is_active: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      // Mock select query (no existing token)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock insert query
      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockInsertSingle = vi
        .fn()
        .mockResolvedValue({ data: mockInsertData, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            insert: mockInsert,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect,
      });

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle,
      });

      const result = await registerDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.data?.token_id).toBe("token-id-456");
      expect(result.error).toBeNull();
    });

    it("should return error when required fields are missing", async () => {
      const request = {
        device_id: "",
        fcm_token: "fcm-token-123",
        platform: "ios" as const,
      };

      const result = await registerDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Missing required fields");
    });

    it("should return error when platform is invalid", async () => {
      const request = {
        device_id: "test-device-1",
        fcm_token: "fcm-token-123",
        platform: "windows" as any,
      };

      const result = await registerDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Invalid platform");
    });

    it("should handle database errors gracefully", async () => {
      const request: RegisterDeviceRequest = {
        device_id: "test-device-1",
        fcm_token: "fcm-token-123",
        platform: "ios",
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

      const result = await registerDevice(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should set is_active to true when registering device", async () => {
      const request: RegisterDeviceRequest = {
        device_id: "test-device-3",
        fcm_token: "fcm-token-999",
        platform: "android",
      };

      const mockInsertData = {
        id: "token-id-789",
        device_id: request.device_id,
        fcm_token: request.fcm_token,
        platform: request.platform,
        user_id: null,
        is_active: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      // Mock select query (no existing token)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock insert query
      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockInsertSingle = vi
        .fn()
        .mockResolvedValue({ data: mockInsertData, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            insert: mockInsert,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect,
      });

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle,
      });

      const result = await registerDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: true,
        }),
      );
    });

    it("should default notifications_enabled to true for new devices", async () => {
      const request: RegisterDeviceRequest = {
        device_id: "test-device-4",
        fcm_token: "fcm-token-111",
        platform: "ios",
      };

      const mockInsertData = {
        id: "token-id-111",
        device_id: request.device_id,
        fcm_token: request.fcm_token,
        platform: request.platform,
        user_id: null,
        is_active: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      // Mock select query (no existing token)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock insert query
      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockInsertSingle = vi
        .fn()
        .mockResolvedValue({ data: mockInsertData, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "device_tokens") {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            insert: mockInsert,
          };
        }
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect,
      });

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle,
      });

      const result = await registerDevice(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications_enabled: true,
        }),
      );
    });
  });
});
