# npm Publishing SOP

This document is for p5kit maintainers. It records how to publish packages and the npm-specific issues already encountered.

## Package Names

Public npm packages:

- `create-p5kit`: used by `npm create p5kit`
- `@p5kit/cli`: CLI package that exposes the `p5kit` binary
- `@p5kit/core`: runtime helpers for sketches, including JavaScript-to-native bridge internals

Do not publish an Android package until the Android shell is implemented.

The unscoped `p5kit` package could not be published because npm rejected it as too similar to `pdfkit`. Use `@p5kit/cli` for the CLI package name and keep the CLI binary named `p5kit`.

npm package names only support one package segment after the scope: `@scope/name`. They cannot be nested as `@p5kit/cli/core` or `@p5kit/core/runtime`.

## Authentication

The npm account uses WebAuthn/security-key authentication. For interactive publishing, use:

```sh
npm publish --auth-type=web
```

For scoped public packages, include:

```sh
npm publish --access public --auth-type=web
```

When npm prints `Press ENTER to open in the browser`, press Enter and complete the security-key or Touch ID confirmation in the browser.

For noninteractive publishing, create a granular access token on npm with write access and `Bypass 2FA` enabled. Never commit a token or `.npmrc` containing a token.

Do not use `--otp` unless the npm account is configured with authenticator-app TOTP. Security-key-only accounts do not have a 6-digit OTP.

## Preflight

Run these checks before publishing:

```sh
git status -sb
npm whoami
npm test
rg "@jinsxk|p5kit-(bridge|core|templates|ios)|@p5kit/(bridge|templates|ios)" README.md README.zh-CN.md docs/development.md packages package.json package-lock.json
```

The `rg` command should return no stale package references unless there is an intentional historical note.

Dry-run each package:

```sh
cd packages/core && npm pack --dry-run && cd ../..
cd packages/cli && npm pack --dry-run && cd ../..
cd packages/create-p5kit && npm pack --dry-run && cd ../..
```

Confirm each tarball only contains the intended package files.

## Versioning

Always bump a package version before publishing. npm does not allow republishing the same version.

Before publishing, compare registry versions with local versions:

```sh
npm view @p5kit/core version
npm view @p5kit/cli version
npm view create-p5kit version
node -p "require('./packages/core/package.json').version"
node -p "require('./packages/cli/package.json').version"
node -p "require('./packages/create-p5kit/package.json').version"
```

Do not publish a version just because it is already written in a local `package.json`. Decide the intended target version first, then update package files to match that decision.

During the `0.x` phase, use these rules:

- Use a patch bump, for example `0.0.1` to `0.0.2`, for publish fixes, dependency cleanup, package contents fixes, metadata fixes, documentation-only package changes, and internal refactors that do not introduce a new user-facing workflow.
- Use a minor bump, for example `0.0.1` to `0.1.0`, only for a deliberate user-facing milestone: a new CLI command, generated project behavior, public runtime API, native app workflow, or intentional public package surface change.
- Keep public package versions aligned when a release requires multiple packages to work together.
- If the correct bump is ambiguous, stop before publishing and decide the exact target versions explicitly.

Publish dependencies before dependents. Current dependency order:

1. `@p5kit/core`
2. `@p5kit/cli`
3. `create-p5kit`

Generated apps depend on `@p5kit/core` and `@p5kit/cli`. `create-p5kit` owns its starter templates directly.

## Publish Commands

From the repository root:

```sh
(cd packages/core && npm publish --access public --auth-type=web)
(cd packages/cli && npm publish --access public --auth-type=web)
(cd packages/create-p5kit && npm publish --auth-type=web)
```

Use `--access public` for scoped packages. `create-p5kit` is unscoped, so it does not need `--access public`.

Do not run `npm publish` from the repository root. The root package is a private monorepo package and publishing it will fail with `EPRIVATE`.

## Verification

Verify registry metadata:

```sh
npm view create-p5kit name version --json
npm view @p5kit/core name version dist-tags --json
npm view @p5kit/cli name version dist-tags --json
npm dist-tag ls @p5kit/core
npm dist-tag ls @p5kit/cli
npm access get status @p5kit/core --json
npm access get status @p5kit/cli --json
```

Verify the CLI package can be downloaded and executed:

```sh
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
npm exec -y --package @p5kit/cli -- p5kit --version
cd -
rm -rf "$TMPDIR"
```

Verify project creation from npm:

```sh
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
npm create p5kit@latest smoke-app
cd smoke-app
npm install
npm run build
npm run build:ios
cd -
rm -rf "$TMPDIR"
```

## Troubleshooting

`E403 Package name too similar to existing package pdfkit`:
Use the scoped package name `@p5kit/cli`. Keep the binary name `p5kit`.

`EPRIVATE`:
You ran `npm publish` from the private monorepo root. Change into the package directory and publish from there.

`E404 @p5kit/core` or `E404 @p5kit/cli` when running `npm create p5kit`:
`create-p5kit` or the template references a package that has not been published yet, or an old package name. Publish `@p5kit/core` and `@p5kit/cli`, bump `create-p5kit`, and republish.

`npm view @p5kit/cli` returns 404 immediately after a successful publish:
Check access and dist-tags. If needed, set public access again and wait for registry metadata to propagate:

```sh
npm access get status @p5kit/cli --json
npm dist-tag ls @p5kit/cli
npm access set status=public @p5kit/cli --auth-type=web
```

`E401 Unauthorized` with an access token:
The token is invalid, expired, copied incompletely, or lacks write access. Generate a new granular token with write access and `Bypass 2FA` enabled.
