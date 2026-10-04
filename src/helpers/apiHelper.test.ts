import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import apiHelper from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should get and set access token correctly", () => {
    expect(apiHelper.getAccessToken()).toBeNull();
    apiHelper.putAccessToken("dummy-token");
    expect(apiHelper.getAccessToken()).toBe("dummy-token");
    apiHelper.putAccessToken("");
    expect(apiHelper.getAccessToken()).toBeNull();
  });

  it("should fetch data without query and append Authorization header when token exists", async () => {
    apiHelper.putAccessToken("test-token");
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    await apiHelper.fetchData("http://localhost:8765/api/v1/users/", {
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/users",
      expect.objectContaining({
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: "Bearer test-token",
        },
      })
    );
  });

  it("should handle url with query parameters and keep custom headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    await apiHelper.fetchData("http://localhost:8765/api/v1/posts?is_me=1", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/posts?is_me=1",
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("should send empty headers when there is no token and no options", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    await apiHelper.fetchData("http://localhost:8765/api/v1/posts");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/posts",
      expect.objectContaining({ headers: {} })
    );
  });

  it("should build query string and skip empty values", () => {
    expect(apiHelper.buildQuery()).toBe("");
    expect(apiHelper.buildQuery({ q: "", is_me: null, x: undefined })).toBe("");
    expect(apiHelper.buildQuery({ is_me: 1, flag: 0 })).toBe("?is_me=1&flag=0");
    expect(apiHelper.buildQuery({ end_date: "2024-10-05 22:00:00" })).toBe(
      "?end_date=2024-10-05+22%3A00%3A00"
    );
  });
});