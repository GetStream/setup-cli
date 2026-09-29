import assert from "node:assert/strict";
import { test } from "node:test";
import { parseVersionInput } from "./main.ts";

test("parseVersionInput takes an exact release or nothing", () => {
  assert.equal(parseVersionInput(""), "");
  assert.equal(parseVersionInput("1.9.0"), "1.9.0");
  assert.equal(parseVersionInput(" v1.9.0 "), "1.9.0");
  assert.throws(
    () => parseVersionInput("v1"),
    /exact release such as 1.9.0.*got v1/,
  );
  assert.throws(() => parseVersionInput("1.9"), /got 1.9/);
  assert.throws(() => parseVersionInput("latest"), /got latest/);
});
