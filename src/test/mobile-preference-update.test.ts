import { describe, it, expect, beforeEach, vi } from "vitest";
import { updatePreferences, UpdatePreferencesRequest } from "@/api/mobile";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Preference Update Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updatePreferences", () => {
    it("should update notifications_enabled to false for existing device", async () => {
      const request: UpdatePreferencesRequest = {
        device_id: "test-device-1",
        notifications_enabled: false,
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

      const result = await updatePreferences(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications_enabled: false,
        }),
      );
    });

    it("should update notifications_enabled to true for existing device", async () => {
      const request: UpdatePreferencesRequest = {
        device_id: "test-device-2",
        notifications_enabled: true,
      };

      const existingToken = {
        id: "token-id-456",
        device_id: request.device_id,
        fcm_token: "fcm-token-456",
        platform: "android",
        user_id: "user-123",
        is_active: true,
        notifications_enabled: false,
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

      const result = await updatePreferences(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications_enabled: true,
        }),
      );
    });

    it("should return error when device_id is missing", async () => {
      const request = {
        device_id: "",
        notifications_enabled: true,
      };

      const result = await updatePreferences(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Missing required fields");
    });

    it("should return error when notifications_enabled is undefined", async () => {
      const request = {
        device_id: "test-device-1",
        notifications_enabled: undefined as any,
      };

      const result = await updatePreferences(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Missing required fields");
    });

    it("should return error when notifications_enabled is not a boolean", async () => {
      const request = {
        device_id: "test-device-1",
        notifications_enabled: "true" as any,
      };

      const result = await updatePreferences(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("must be a boolean");
    });

    it("should return error when device does not exist", async () => {
      const request: UpdatePreferencesRequest = {
        device_id: "non-existent-device",
        notifications_enabled: false,
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

      const result = await updatePreferences(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Device not found");
    });

    it("should handle database errors gracefully", async () => {
      const request: UpdatePreferencesRequest = {
        device_id: "test-device-1",
        notifications_enabled: false,
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

      const result = await updatePreferences(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should update updated_at timestamp when updating preferences", async () => {
      const request: UpdatePreferencesRequest = {
        device_id: "test-device-1",
        notifications_enabled: false,
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

      const result = await updatePreferences(request);

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        }),
      );
    });

    it("should handle update errors from database", async () => {
      const request: UpdatePreferencesRequest = {
        device_id: "test-device-1",
        notifications_enabled: false,
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

      const result = await updatePreferences(request);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBe(updateError);
    });
  });
});
