import { test } from "node:test";
import assert from "node:assert/strict";
import { withBasePath } from "../src/lib/paths.ts";
test("raw asset and data URLs respect project Pages subpaths", () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    process.env.NEXT_PUBLIC_BASE_PATH = "";
    assert.equal(withBasePath("/data/example.json"), "/data/example.json");
    process.env.NEXT_PUBLIC_BASE_PATH = "/project";
    assert.equal(withBasePath("/"), "/project/");
    assert.equal(
      withBasePath("/data/example.json"),
      "/project/data/example.json",
    );
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = original;
  }
});
