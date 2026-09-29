# Setup Stream CLI

A GitHub Action that installs the [Stream CLI](https://getstream.io/cli) on
the runner and puts `getstream` on `PATH`.

## Usage

```yaml
steps:
  - uses: GetStream/setup-cli@v1
  - run: getstream status
    env:
      STREAM_API_KEY: ${{ secrets.STREAM_API_KEY }}
      STREAM_API_SECRET: ${{ secrets.STREAM_API_SECRET }}
```

Pin a version, and write the CLI's global config from the workflow:

```yaml
  - uses: GetStream/setup-cli@v1
    with:
      version: 1.9.1
      config: |
        dashboard_url: https://dashboard.getstream.io
```

## Inputs

| Input | Default | What it does |
| --- | --- | --- |
| `version` | | An exact version to install, such as `1.9.0`. Empty installs the newest. |
| `config` | | What to write to `~/.stream/config.yaml` on the runner, as YAML. |

## Outputs

| Output | What it is |
| --- | --- |
| `version` | The version installed, such as `1.9.1`. |

## Versions

The action's major version tracks the CLI's. With no `version`,
`setup-cli@v1` installs the newest CLI 1.x on every run, so a CLI 2.0
changes nothing for it until the workflow moves to `setup-cli@v2`.
`version` pins an exact release instead; there are no ranges or tags.

## How it works

The action reads the release manifest, downloads the build for the runner's
platform, verifies its sha256, and files it in the runner's tool cache under
`getstream/<version>/<arch>`, the layout the other setup actions use, on
`PATH` for the rest of the job. On GitHub-hosted runners the tool cache
starts empty every job, so each job downloads once. On self-hosted runners
it persists, so a version already there is not downloaded again. The action
runs on the runner's own Node.js and needs nothing else installed.

The CLI's global config is the action's to write: `config` becomes
`~/.stream/config.yaml` as given, replacing what the runner had. Telemetry is
off unless the config sets `telemetry` itself, since every runner would
otherwise count as a new install. The CLI runs non-interactively under
Actions on its own, and `getstream update` refuses because the action owns
the installation.

## Developing

`src/` is the source and `dist/index.js` the bundle that `action.yml` runs,
built by esbuild with `npm run build` and committed, since the runner
installs nothing. A change to `src/` is finished once `dist/` is rebuilt;
the check job rebuilds it and fails on a difference. `npm run check`
type-checks, and `npm test` runs the unit tests from the source directly,
Node 24 stripping the types.

## Platforms

Linux and macOS runners, x64 and arm64. There is no Windows build of the CLI.

## Releasing

Tag a release `v1.2.3` and publish it; the Release workflow moves `v1` to it.

## License

See [LICENSE.md](LICENSE.md).
