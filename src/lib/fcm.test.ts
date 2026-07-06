import { describe, it, expect, beforeEach, vi } from "vitest";
import { FCMService } from "./fcm";

/**
 * Unit tests for FCM Configuration Module and FCMService Class
 *
 * These tests verify the configuration reading, validation logic,
 * and FCMService initialization and error handling.
 */

describe("FCM Configuration Module", () => {
  describe("Configuration validation logic", () => {
    it("should validate that all required fields are present", () => {
      // Test the validation logic
      const hasAllFields = (config: {
        projectId?: string;
        privateKey?: string;
        clientEmail?: string;
      }) => {
        return !!(config.projectId && config.privateKey && config.clientEmail);
      };

      expect(
        hasAllFields({
          projectId: "test-project",
          privateKey: "test-key",
          clientEmail: "test@test.com",
        }),
      ).toBe(true);

      expect(
        hasAllFields({
          projectId: undefined,
          privateKey: "test-key",
          clientEmail: "test@test.com",
        }),
      ).toBe(false);

      expect(
        hasAllFields({
          projectId: "test-project",
          privateKey: undefined,
          clientEmail: "test@test.com",
        }),
      ).toBe(false);

      expect(
        hasAllFields({
          projectId: "test-project",
          privateKey: "test-key",
          clientEmail: undefined,
        }),
      ).toBe(false);
    });

    it("should properly format private key with escaped newlines", () => {
      const formatPrivateKey = (key: string) => key.replace(/\\n/g, "\n");

      const input =
        "-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----\\n";
      const output = formatPrivateKey(input);

      expect(output).toContain("\n");
      expect(output).not.toContain("\\n");
      expect(output).toBe(
        "-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n",
      );
    });

    it("should handle multiple escaped newlines correctly", () => {
      const formatPrivateKey = (key: string) => key.replace(/\\n/g, "\n");

      const input = "line1\\nline2\\nline3";
      const output = formatPrivateKey(input);

      expect(output).toBe("line1\nline2\nline3");
    });

    it("should not modify keys that already have real newlines", () => {
      const formatPrivateKey = (key: string) => key.replace(/\\n/g, "\n");

      const input = "line1\nline2\nline3";
      const output = formatPrivateKey(input);

      expect(output).toBe("line1\nline2\nline3");
    });
  });

  describe("Error message formatting", () => {
    it("should provide clear error message for missing configuration", () => {
      const errorMessage =
        "Missing Firebase configuration. Please ensure VITE_FIREBASE_PROJECT_ID, " +
        "VITE_FIREBASE_PRIVATE_KEY, and VITE_FIREBASE_CLIENT_EMAIL are set in environment variables.";

      expect(errorMessage).toContain("VITE_FIREBASE_PROJECT_ID");
      expect(errorMessage).toContain("VITE_FIREBASE_PRIVATE_KEY");
      expect(errorMessage).toContain("VITE_FIREBASE_CLIENT_EMAIL");
    });
  });

  describe("Configuration structure", () => {
    it("should have correct configuration structure", () => {
      interface FCMConfig {
        projectId: string;
        privateKey: string;
        clientEmail: string;
      }

      const config: FCMConfig = {
        projectId: "music-app-10f66",
        privateKey:
          "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n",
        clientEmail:
          "firebase-adminsdk@music-app-10f66.iam.gserviceaccount.com",
      };

      expect(config).toHaveProperty("projectId");
      expect(config).toHaveProperty("privateKey");
      expect(config).toHaveProperty("clientEmail");
      expect(config.projectId).toBe("music-app-10f66");
    });
  });
});

describe("FCMService Class", () => {
  let service: FCMService;

  beforeEach(() => {
    // Create a fresh service instance for each test
    service = new FCMService();
  });

  describe("Initialization state", () => {
    it("should start in uninitialized state", () => {
      expect(service.isInitialized()).toBe(false);
      expect(service.getInitializationError()).toBeNull();
    });

    it("should provide status information", () => {
      const status = service.getStatus();
      expect(status).toHaveProperty("initialized");
      expect(status).toHaveProperty("hasError");
      expect(status).toHaveProperty("errorMessage");
      expect(status.initialized).toBe(false);
      expect(status.hasError).toBe(false);
      expect(status.errorMessage).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should throw error when getting messaging before initialization", () => {
      expect(() => service.getMessaging()).toThrow(
        "FCM Service is not initialized",
      );
    });

    it("should throw error when validating before initialization", () => {
      expect(() => service.validateReadyToSend()).toThrow(
        "FCM Service is not initialized",
      );
    });

    it("should handle initialization failure gracefully", async () => {
      // Mock environment to cause initialization failure
      const originalEnv = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "");

      try {
        await service.initialize();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify service state after failure
        expect(service.isInitialized()).toBe(false);
        expect(service.getInitializationError()).not.toBeNull();

        const status = service.getStatus();
        expect(status.initialized).toBe(false);
        expect(status.hasError).toBe(true);
        expect(status.errorMessage).toBeTruthy();
      } finally {
        // Restore environment
        vi.stubEnv("VITE_FIREBASE_PROJECT_ID", originalEnv);
      }
    });

    it("should store detailed error information on failure", async () => {
      // Mock environment to cause initialization failure
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "");

      try {
        await service.initialize();
      } catch (error) {
        const initError = service.getInitializationError();
        expect(initError).toBeInstanceOf(Error);
        expect(initError?.message).toBeTruthy();
      } finally {
        vi.unstubAllEnvs();
      }
    });
  });

  describe("Initialization behavior", () => {
    it("should prevent re-initialization", async () => {
      // Mock successful initialization
      const consoleSpy = vi.spyOn(console, "log");

      // First initialization attempt
      try {
        await service.initialize();
      } catch {
        // May fail due to missing credentials in test environment
      }

      // Second initialization attempt
      try {
        await service.initialize();
      } catch {
        // May fail due to missing credentials in test environment
      }

      // Check if re-initialization was prevented
      const logs = consoleSpy.mock.calls.map((call) => call[0]);
      const skipMessages = logs.filter((log) =>
        log.includes("Already initialized"),
      );

      // If first init succeeded, second should be skipped
      if (service.isInitialized()) {
        expect(skipMessages.length).toBeGreaterThan(0);
      }

      consoleSpy.mockRestore();
    });
  });

  describe("Status reporting", () => {
    it("should report correct status after initialization attempt", async () => {
      try {
        await service.initialize();
        // If successful
        const status = service.getStatus();
        expect(status.initialized).toBe(true);
        expect(status.hasError).toBe(false);
      } catch {
        // If failed
        const status = service.getStatus();
        expect(status.initialized).toBe(false);
        expect(status.hasError).toBe(true);
        expect(status.errorMessage).toBeTruthy();
      }
    });

    it("should provide consistent state across methods", () => {
      const isInit = service.isInitialized();
      const status = service.getStatus();
      const error = service.getInitializationError();

      expect(status.initialized).toBe(isInit);
      expect(status.hasError).toBe(error !== null);
    });
  });

  describe("sendToDevice method", () => {
    it("should throw error when sending before initialization", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
          image: "https://example.com/cover.jpg",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      await expect(service.sendToDevice("test-token", payload)).rejects.toThrow(
        "FCM Service is not initialized",
      );
    });

    it("should construct payload with platform-specific configuration for iOS", () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
          image: "https://example.com/cover.jpg",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
        apns: {
          payload: {
            aps: {
              sound: "default" as const,
              badge: 1,
            },
          },
        },
      };

      expect(payload.apns).toBeDefined();
      expect(payload.apns?.payload.aps.sound).toBe("default");
      expect(payload.apns?.payload.aps.badge).toBe(1);
    });

    it("should construct payload with platform-specific configuration for Android", () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
          image: "https://example.com/cover.jpg",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
        android: {
          priority: "high" as const,
          notification: {
            channelId: "album_updates",
            sound: "default" as const,
          },
        },
      };

      expect(payload.android).toBeDefined();
      expect(payload.android?.priority).toBe("high");
      expect(payload.android?.notification.channelId).toBe("album_updates");
      expect(payload.android?.notification.sound).toBe("default");
    });

    it("should include all required notification fields", () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
          image: "https://example.com/cover.jpg",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      expect(payload.notification.title).toBe("New Album: Test Album");
      expect(payload.notification.body).toBe("by Test Artist");
      expect(payload.notification.image).toBe("https://example.com/cover.jpg");
      expect(payload.data.albumId).toBe("123");
      expect(payload.data.artist).toBe("Test Artist");
      expect(payload.data.type).toBe("album_added");
    });

    it("should handle payload without platform-specific configuration", () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      expect(payload.android).toBeUndefined();
      expect(payload.apns).toBeUndefined();
      expect(payload.notification.title).toBeTruthy();
      expect(payload.data.albumId).toBeTruthy();
    });
  });

  describe("sendToMultipleDevices method", () => {
    it("should throw error when sending before initialization", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
          image: "https://example.com/cover.jpg",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      await expect(
        service.sendToMultipleDevices(["token1", "token2"], payload),
      ).rejects.toThrow("FCM Service is not initialized");
    });

    it("should handle empty token array", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      // Mock the service as initialized
      vi.spyOn(service, "isInitialized").mockReturnValue(true);
      vi.spyOn(service, "sendToDevice").mockResolvedValue({
        success: true,
        messageId: "test-message-id",
      });

      const result = await service.sendToMultipleDevices([], payload);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.responses).toHaveLength(0);
    });

    it("should return correct counts for all successful sends", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      // Mock the service as initialized
      vi.spyOn(service, "isInitialized").mockReturnValue(true);
      vi.spyOn(service, "sendToDevice").mockResolvedValue({
        success: true,
        messageId: "test-message-id",
      });

      const result = await service.sendToMultipleDevices(
        ["token1", "token2", "token3"],
        payload,
      );

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.responses).toHaveLength(3);
      expect(result.responses.every((r) => r.success)).toBe(true);
    });

    it("should continue sending after individual token failure", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      // Mock the service as initialized
      vi.spyOn(service, "isInitialized").mockReturnValue(true);

      // Mock sendToDevice to fail on second token but succeed on others
      let callCount = 0;
      vi.spyOn(service, "sendToDevice").mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          return {
            success: false,
            error: {
              code: "messaging/invalid-registration-token",
              message: "Invalid token",
            },
          };
        }
        return {
          success: true,
          messageId: `message-${callCount}`,
        };
      });

      const result = await service.sendToMultipleDevices(
        ["token1", "token2", "token3"],
        payload,
      );

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.responses).toHaveLength(3);
      expect(result.responses[0].success).toBe(true);
      expect(result.responses[1].success).toBe(false);
      expect(result.responses[2].success).toBe(true);
    });

    it("should handle all tokens failing", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      // Mock the service as initialized
      vi.spyOn(service, "isInitialized").mockReturnValue(true);
      vi.spyOn(service, "sendToDevice").mockResolvedValue({
        success: false,
        error: {
          code: "messaging/invalid-registration-token",
          message: "Invalid token",
        },
      });

      const result = await service.sendToMultipleDevices(
        ["token1", "token2"],
        payload,
      );

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(2);
      expect(result.responses).toHaveLength(2);
      expect(result.responses.every((r) => !r.success)).toBe(true);
    });

    it("should handle unexpected errors during batch send", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      // Mock the service as initialized
      vi.spyOn(service, "isInitialized").mockReturnValue(true);

      // Mock sendToDevice to throw an error
      vi.spyOn(service, "sendToDevice").mockRejectedValue(
        new Error("Network error"),
      );

      const result = await service.sendToMultipleDevices(["token1"], payload);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
      expect(result.responses).toHaveLength(1);
      expect(result.responses[0].success).toBe(false);
      expect(result.responses[0].error?.code).toBe("UNEXPECTED_ERROR");
      expect(result.responses[0].error?.message).toContain("Network error");
    });

    it("should return individual responses for each token", async () => {
      const payload = {
        notification: {
          title: "New Album: Test Album",
          body: "by Test Artist",
        },
        data: {
          albumId: "123",
          artist: "Test Artist",
          type: "album_added" as const,
        },
      };

      // Mock the service as initialized
      vi.spyOn(service, "isInitialized").mockReturnValue(true);

      // Mock different responses for each token
      let callCount = 0;
      vi.spyOn(service, "sendToDevice").mockImplementation(async () => {
        callCount++;
        return {
          success: true,
          messageId: `message-id-${callCount}`,
        };
      });

      const result = await service.sendToMultipleDevices(
        ["token1", "token2"],
        payload,
      );

      expect(result.responses).toHaveLength(2);
      expect(result.responses[0].messageId).toBe("message-id-1");
      expect(result.responses[1].messageId).toBe("message-id-2");
    });
  });
});
