import { test, expect, describe } from "bun:test";
import { detectRasterImage } from "@/lib/cms/image-signature";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

describe("detectRasterImage", () => {
  test("detects PNG", () => {
    expect(detectRasterImage(png)).toEqual({ ext: "png", contentType: "image/png" });
  });
  test("detects JPEG", () => {
    expect(detectRasterImage(jpeg)).toEqual({ ext: "jpg", contentType: "image/jpeg" });
  });
  test("detects GIF", () => {
    expect(detectRasterImage(gif)).toEqual({ ext: "gif", contentType: "image/gif" });
  });
  test("detects WebP", () => {
    expect(detectRasterImage(webp)).toEqual({ ext: "webp", contentType: "image/webp" });
  });

  test("rejects SVG (stored-XSS vector) even though it is 'an image'", () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect(detectRasterImage(svg)).toBeNull();
  });

  test("rejects HTML masquerading as an image", () => {
    const html = new TextEncoder().encode("<!DOCTYPE html><script>alert(1)</script>");
    expect(detectRasterImage(html)).toBeNull();
  });

  test("rejects empty / too-short input", () => {
    expect(detectRasterImage(new Uint8Array([]))).toBeNull();
    expect(detectRasterImage(new Uint8Array([0x89, 0x50]))).toBeNull();
  });

  test("does not misfire on a RIFF container that is not WebP", () => {
    const riffWav = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]);
    expect(detectRasterImage(riffWav)).toBeNull();
  });
});
