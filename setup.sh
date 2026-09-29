#!/usr/bin/env bash
# The steps of the Setup Stream CLI action, one per invocation:
#
#   install    npm install the CLI into a prefix of its own, on PATH
#   configure  write ~/.stream/config.yaml and report the version
#
# action.yml passes the inputs and the install step's outputs in the
# environment.
set -euo pipefail

PACKAGE=@stream-io/cli

die() {
  echo "::error::$*" >&2
  exit 1
}

output() {
  echo "$1=$2" >> "$GITHUB_OUTPUT"
}

install() {
  local prefix="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/getstream-cli" version="${INPUT_VERSION:-latest}"
  command -v npm >/dev/null 2>&1 || die "npm is needed to install the Stream CLI; add actions/setup-node before this step"
  [[ -n "$version" ]] || die "version is empty"
  mkdir -p "$prefix"
  NPM_CONFIG_UPDATE_NOTIFIER=false npm install --prefix "$prefix" --engine-strict --no-audit --no-fund --loglevel=warn "$PACKAGE@$version" \
    || die "could not install $PACKAGE@$version"
  echo "$prefix/node_modules/.bin" >> "$GITHUB_PATH"
  output path "$prefix/node_modules/.bin/getstream"
}

configure() {
  local file="$HOME/.stream/config.yaml" config="${INPUT_CONFIG:-}" reported
  mkdir -p "$HOME/.stream"
  printf '%s' "$config" > "$file"
  [[ -z "$config" || "$config" == *$'\n' ]] || echo >> "$file"
  grep -Eq '^[[:space:]]*telemetry:' "$file" || echo "telemetry: off" >> "$file"

  reported=$("$BINARY" --version) || die "$BINARY --version failed"
  [[ "$reported" == "Stream CLI "* ]] || die "unexpected version output: $reported"
  output version "${reported#Stream CLI }"
  echo "$reported"
}

case "${1:-}" in
  install | configure) "$1" ;;
  *) die "usage: setup.sh install|configure" ;;
esac
