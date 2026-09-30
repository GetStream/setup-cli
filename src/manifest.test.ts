import assert from "node:assert/strict";
import { test } from "node:test";
import { isManifestFor, manifestUrl, parseManifest } from "./manifest.ts";
import type { Manifest } from "./manifest.ts";

test("manifestUrl names a major's manifest or an exact version's", () => {
  assert.equal(manifestUrl("1"), "https://getstream.io/cli/v1.json");
  assert.equal(manifestUrl("1.9.0"), "https://getstream.io/cli/v1.9.0.json");
});

test("isManifestFor matches a manifest to the name it was fetched under", () => {
  const manifest = (version: string): Manifest => ({
    version,
    binaries: {},
    source: `https://getstream.io/cli/v${version}.json`,
  });
  assert.equal(isManifestFor(manifest("1.9.1"), "1"), true);
  assert.equal(isManifestFor(manifest("1.9.0"), "1.9.0"), true);
  assert.equal(isManifestFor(manifest("2.0.0"), "1"), false);
  assert.equal(isManifestFor(manifest("11.0.0"), "1"), false);
  assert.equal(isManifestFor(manifest("1.9.1"), "1.9.0"), false);
});

test("parseManifest accepts a manifest and lists every wrong field", () => {
  const url = "https://getstream.io/cli/v1.json";
  const sha =
    "d21f992086f024937256455d39f36af0867e748b2b9a2daee967a3838656ff2c";
  const manifest = {
    version: "1.9.1",
    binaries: {
      linux_arm64: {
        url: "/cli/releases/1.9.1/stream-linux-arm64.bin",
        sha256: sha,
      },
    },
  };
  assert.deepEqual(parseManifest(manifest, url), manifest);
  assert.throws(
    () => parseManifest({}, url),
    /^Error: The manifest at .* is malformed:\n {2}version: Invalid key/,
  );
  assert.throws(
    () =>
      parseManifest(
        {
          version: "latest",
          binaries: { linux_arm64: { url: "", sha256: "nope" } },
        },
        url,
      ),
    /malformed:\n {2}version: Invalid version: expected semver\n {2}binaries\.linux_arm64\.url: Invalid url: expected a non-empty string\n {2}binaries\.linux_arm64\.sha256: Invalid sha256: expected 64 hex digits$/,
  );
  assert.throws(
    () => parseManifest("text", url),
    /malformed:\n {2}manifest: Invalid type/,
  );
});
