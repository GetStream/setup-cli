import { HttpClient, HttpClientError } from "@actions/http-client";
import * as v from "valibot";

const MANIFESTS_BASE = "https://getstream.io/cli";

const ManifestSchema = v.object({
  version: v.pipe(
    v.string(),
    v.regex(/^\d+(\.\d+)+/, "Invalid version: expected semver"),
  ),
  binaries: v.record(
    v.string(),
    v.object({
      url: v.pipe(v.string(), v.nonEmpty("Invalid url: expected a non-empty string")),
      sha256: v.pipe(
        v.string(),
        v.regex(/^[0-9a-fA-F]{64}$/, "Invalid sha256: expected 64 hex digits"),
      ),
    }),
  ),
});

export type Manifest = v.InferOutput<typeof ManifestSchema> & {
  source: string;
};

// fetchManifest reads the manifest for a major, such as 1, or for an exact
// release, such as 1.9.0, and checks that it describes one.
export async function fetchManifest(ref: string): Promise<Manifest> {
  const url = manifestUrl(ref);
  const manifest = await fetchFrom(url);

  if (manifest.version !== ref && !manifest.version.startsWith(`${ref}.`)) {
    throw new Error(
      `The manifest at ${url} describes Stream CLI ${manifest.version}, not ${ref}`,
    );
  }

  return manifest;
}

async function fetchFrom(url: string): Promise<Manifest> {
  const client = new HttpClient("setup-cli", [], {
    allowRetries: true,
    maxRetries: 3,
    socketTimeout: 30_000,
  });

  const response = await client.getJson<unknown>(url).catch((err: unknown) => {
    if (err instanceof HttpClientError) {
      return { statusCode: err.statusCode, result: null };
    }

    throw new Error(
      `Failed to fetch the manifest from ${url}: ${err instanceof Error ? err.message : String(err)}`,
    );
  });

  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to fetch the manifest from ${url}, got HTTP ${response.statusCode}`,
    );
  }

  if (response.result === null) {
    throw new Error(`The manifest at ${url} is not valid JSON`);
  }

  return { ...parseManifest(response.result, url), source: url };
}

export function parseManifest(
  value: unknown,
  url: string,
): v.InferOutput<typeof ManifestSchema> {
  const result = v.safeParse(ManifestSchema, value);
  if (result.success) {
    return result.output;
  }

  const issues = result.issues.map(
    (issue) => `  ${v.getDotPath(issue) ?? "manifest"}: ${issue.message}`,
  );
  throw new Error(`The manifest at ${url} is malformed:\n${issues.join("\n")}`);
}

export function manifestUrl(ref: string): string {
  return `${MANIFESTS_BASE}/v${ref}.json`;
}
