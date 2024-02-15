import { process } from "std-env";
import { describe, expect, it } from "vitest";

import { resolveMaybeUrlArg } from "../src/internal/get-full-api-url";

// TODO: Fix these to run effects

describe("getFullApiUrl", () => {
  it("should return the provided url if it is already absolute", () => {
    const url = "https://example.com/foo/bar";
    expect(resolveMaybeUrlArg(url).href).toBe(url);
  });

  it("should add `window.location.origin` if the url is relative and request is clientside", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    global.window = {
      location: {
        origin: "http://example.com",
      },
    } as any;

    expect(resolveMaybeUrlArg("/foo/bar").href).toBe(
      "http://example.com/foo/bar",
    );

    // @ts-expect-error - delete globalThis
    delete global.window;
  });

  it("should take VERCEL_URL if present and url is relative", () => {
    process.env.VERCEL_URL = "example.com";

    expect(resolveMaybeUrlArg("/foo/bar").href).toBe(
      "https://example.com/foo/bar",
    );

    delete process.env.VERCEL_URL;
  });

  it("assumes localhost if no VERCEL_URL and url is relative", () => {
    expect(resolveMaybeUrlArg("/foo/bar").href).toBe(
      "http://localhost:3000/foo/bar",
    );
  });

  it("should use `/api/uploadthing` pathname if no url is provided", () => {
    expect(resolveMaybeUrlArg("").href).toBe(
      "http://localhost:3000/api/uploadthing",
    );
  });

  it("should add `/api/uploadthing` if url only has a origin", () => {
    expect(resolveMaybeUrlArg("http://example.com").href).toBe(
      "http://example.com/api/uploadthing",
    );
  });
});
