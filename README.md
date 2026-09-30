# Setup Stream CLI

A GitHub Action that makes the [Stream CLI](https://getstream.io/cli) available
as `getstream` on the runner.

## Usage

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      STREAM_API_KEY: ${{ secrets.STREAM_API_KEY }}
      STREAM_API_SECRET: ${{ secrets.STREAM_API_SECRET }}
    steps:
      - uses: GetStream/setup-cli@v1
      - run: getstream status
```

Optionally, pin a version:

```yaml
- uses: GetStream/setup-cli@v1
  with:
    version: 1.9.1
```

Optionally, override the CLI's global config:

```yaml
- uses: GetStream/setup-cli@v1
  with:
    config: |
      dashboard_url: https://dashboard.getstream.io
```

## Authentication

The CLI authenticates with the app's API key and secret from `STREAM_API_KEY`
and `STREAM_API_SECRET`. Do not use `getstream login` for authentication in CI.
Put the credentials in repository secrets and pass them in `env`.

Commands like `init` and `open`, and the `--app-id` flag, won't work. Run
`getstream status` to check that your key and secret are accepted.

## Inputs

| Input     | What it does                                                         |
| --------- | -------------------------------------------------------------------- |
| `version` | Exact version to install, such as 1.9.1. Omit to install the latest. |
| `config`  | Override the CLI's global config (YAML string).                      |

## Outputs

| Output    | What it is                            |
| --------- | ------------------------------------- |
| `version` | The installed version, such as 1.9.1. |

## Versions

The action's major version tracks the CLI's. If and when CLI 2.0 is released,
this action will keep installing the latest CLI 1.x release. In other words,
your workflow will not break on a breaking CLI release.

For a stronger compatibility guarantee, pin `version` to an exact release.

## Platforms

Linux and macOS runners, x64 and arm64. There is no Windows build of the CLI.

## License

See [LICENSE.md](LICENSE.md).
