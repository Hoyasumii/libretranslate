# Security Policy

## Supported versions

Only the latest release of `@hoyasumii/libretranslate` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue. Report it privately through
[GitHub's private vulnerability reporting](https://github.com/Hoyasumii/libretranslate/security/advisories/new), or by
email to alanreisanjo@gmail.com.

Include the affected version, what an attacker can do, and the steps to reproduce it. You should get an answer
within a week. Once a fix is released, the advisory is published with credit to you, unless you prefer otherwise.

## Scope

Things worth reporting include, among others:

- a way to leak the LibreTranslate API key: through logs, error messages, the saved `.env`, or the daemon state file;
- a way to reach the MCP HTTP server (`libretranslate mcp start`) from anything other than the local machine, or to call
  its `/shutdown` without the token;
- a way for a tool call to send a suggestion without `confirm: true`, or for `libretranslate_translate_file` to
  replace an existing file without `overwrite: true`;
- command injection through `libretranslate mcp install`/`uninstall` or the login service they set up.

Vulnerabilities in LibreTranslate itself belong to [LibreTranslate/LibreTranslate](https://github.com/LibreTranslate/LibreTranslate/security).
