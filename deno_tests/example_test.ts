// @ts-nocheck: This file uses Deno-specific imports and globals not recognized by tsc or standard TypeScript tooling.
import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("simple test", () => {
  assertEquals(1 + 1, 2);
}); 