import * as core from "@actions/core";
import { getCliVersion, installCli, writeCliConfig } from "./cli.ts";
import { fetchManifest } from "./manifest.ts";

const MAJOR = "1";

if (import.meta.main) {
  run().catch((error: unknown) => {
    core.setFailed(error instanceof Error ? error.message : "Unexpected error");
  });
}

async function run(): Promise<void> {
  const wanted = parseVersionInput(core.getInput("version"));
  const manifest = await fetchManifest(wanted || MAJOR);
  const cli = await installCli(manifest);
  core.addPath(cli);
  await writeCliConfig(core.getInput("config"));
  core.exportVariable("STREAM_CLI_SELF_UPDATE", "off");
  const installed = await getCliVersion(cli);

  if (major(installed) !== MAJOR) {
    throw new Error(
      `Installed Stream CLI ${installed} is not a ${MAJOR}.x release; update the action`,
    );
  }

  if (wanted && installed !== wanted) {
    throw new Error(
      `Installed Stream CLI reports version ${installed}, expected ${wanted}`,
    );
  }

  core.setOutput("version", installed);
  core.info(`Stream CLI ${installed}`);
}

export function parseVersionInput(input: string): string {
  const version = input.trim().replace(/^v/, "");
  if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `The version input must be an exact release such as 1.9.1, or empty for the newest; got ${input.trim()}`,
    );
  }
  return version;
}

function major(version: string): string {
  return version.split(".")[0];
}
