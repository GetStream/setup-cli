import assert from "node:assert/strict";
import { test } from "node:test";
import { parseVersion, platformKey, renderConfig } from "./cli.ts";

test("platformKey maps the runner onto the manifest's keys", () => {
  assert.equal(platformKey("linux", "x64"), "linux_amd64");
  assert.equal(platformKey("linux", "arm64"), "linux_arm64");
  assert.equal(platformKey("darwin", "x64"), "darwin_amd64");
  assert.equal(platformKey("darwin", "arm64"), "darwin_arm64");
  assert.throws(
    () => platformKey("win32", "x64"),
    /No Stream CLI build for win32 x64; there are builds for linux_amd64, linux_arm64, darwin_amd64, darwin_arm64/,
  );
});

test("parseVersion reads either version line", () => {
  assert.equal(parseVersion("Stream CLI 1.9.1\n"), "1.9.1");
  assert.equal(parseVersion("getstream version 0.1.93"), "0.1.93");
  assert.throws(
    () => parseVersion("something else\n"),
    /Unexpected version output: something else$/,
  );
});

test("renderConfig writes the input as given, with telemetry off unless set", () => {
  assert.equal(renderConfig(""), "telemetry: off\n");
  assert.equal(
    renderConfig("dashboard_url: https://x\n"),
    "dashboard_url: https://x\ntelemetry: off\n",
  );
  assert.equal(
    renderConfig("dashboard_url: https://x"),
    "dashboard_url: https://x\ntelemetry: off\n",
  );
  assert.equal(renderConfig("telemetry: on\n"), "telemetry: on\n");
});
