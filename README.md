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
| `version` | `latest` | The version to install, as npm reads it: `1.9.1`, `^1.9`, or a tag such as `latest`. |
| `config` | | What to write to `~/.stream/config.yaml` on the runner, as YAML. |

## Outputs

| Output | What it is |
| --- | --- |
| `version` | The version installed, such as `1.9.1`. |

## How it works

The CLI comes from the `@stream-io/cli` npm package, installed into a
directory of its own under the runner's temp space rather than the global
prefix, so nothing else on the runner is touched, and put on `PATH` for the
rest of the job. npm resolves the version and checks the package's
integrity. The runner needs Node.js 22.15 or newer,
which the GitHub-hosted images have; on other runners, add
`actions/setup-node` before this step.

The CLI's global config is the action's to write: `config` becomes
`~/.stream/config.yaml` as given, replacing what the runner had. Telemetry is
off unless the config sets `telemetry` itself, since every runner would
otherwise count as a new install. The CLI runs non-interactively under
Actions on its own, and `getstream update` refuses because npm owns the
installation.

## Platforms

Linux and macOS runners, x64 and arm64. There is no Windows build of the CLI.

## Releasing

Tag a release `v1.2.3` and publish it; the Release workflow moves `v1` to it.

## License

See [LICENSE.md](LICENSE.md).
