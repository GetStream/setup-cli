import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Manifest } from "./manifest.ts";

const TOOL = "getstream";

const OS: Record<string, string | undefined> = {
  linux: "linux",
  darwin: "darwin",
};

const CPU: Record<string, string | undefined> = {
  x64: "amd64",
  arm64: "arm64",
};

export async function installCli(manifest: Manifest): Promise<string> {
  const cached = tc.find(TOOL, manifest.version);
  if (cached) {
    core.info(`Stream CLI ${manifest.version} is in the tool cache`);
    return cached;
  }

  const key = platformKey();
  const binary = manifest.binaries[key];

  if (!binary) {
    throw new Error(`No Stream CLI ${manifest.version} build for ${key}`);
  }

  core.info(`Installing Stream CLI ${manifest.version} (${key})`);
  const file = await tc.downloadTool(
    new URL(binary.url, manifest.source).toString(),
  );
  const got = createHash("sha256")
    .update(await readFile(file))
    .digest("hex");

  if (got !== binary.sha256.toLowerCase()) {
    throw new Error(
      `Checksum mismatch for ${binary.url}: got ${got}, want ${binary.sha256}`,
    );
  }

  await chmod(file, 0o755);
  return tc.cacheFile(file, TOOL, TOOL, manifest.version);
}

export async function writeCliConfig(input: string): Promise<void> {
  const dir = join(homedir(), ".stream");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "config.yaml"), renderConfig(input));
}

export async function getCliVersion(dir: string): Promise<string> {
  const { stdout } = await exec.getExecOutput(
    join(dir, TOOL),
    ["--version"],
    { silent: true },
  );
  return parseVersion(stdout);
}

export function renderConfig(input: string): string {
  let config = input;
  if (config && !config.endsWith("\n")) {
    config += "\n";
  }
  if (!/^\s*telemetry:/m.test(config)) {
    config += "telemetry: off\n";
  }
  return config;
}

export function platformKey(
  platform: string = process.platform,
  arch: string = process.arch,
): string {
  const os = OS[platform];
  const cpu = CPU[arch];

  if (!os || !cpu) {
    throw new Error(
      `No Stream CLI build for ${platform} ${arch}; there are builds for ${platformKeys().join(", ")}`,
    );
  }

  return `${os}_${cpu}`;
}

export function parseVersion(output: string): string {
  const version = output.trim().split(/\s+/).pop() ?? "";
  if (!/^\d+(\.\d+)+/.test(version)) {
    throw new Error(`Unexpected version output: ${output.trim()}`);
  }
  return version;
}

function platformKeys(): string[] {
  return Object.values(OS).flatMap((os) =>
    Object.values(CPU).map((cpu) => `${os}_${cpu}`),
  );
}
