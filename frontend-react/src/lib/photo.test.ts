import { describe, expect, it } from "vitest";
import { isLocalPhotoPath } from "./photo";

describe("isLocalPhotoPath", () => {
  it("rejects Windows file paths that cannot load in the browser", () => {
    expect(isLocalPhotoPath("C:\\Users\\me\\pic.jpg")).toBe(true);
    expect(isLocalPhotoPath("file:///C:/Users/me/pic.jpg")).toBe(true);
  });

  it("allows http and data URLs", () => {
    expect(isLocalPhotoPath("https://example.com/a.jpg")).toBe(false);
    expect(isLocalPhotoPath("data:image/jpeg;base64,abc")).toBe(false);
  });
});
