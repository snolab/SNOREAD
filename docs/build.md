# Build the Chrome extension

Install Node.js and Python 3, then run `npm run build` (or `build.bat` on
Windows). No Python packages are required. The output is
`dist/SNOREAD_CHROME_EXTENSION.zip`, with `manifest.json` at the archive root
and forward-slash entry paths. This is a ZIP, not a signed CRX.

For a local check, open `chrome://extensions`, enable Developer mode, and
load the `src` directory with **Load unpacked**. Visit a long article over
HTTP or HTTPS, confirm the horizontal reading layout, and press Escape to
exit it.

The package and manifest versions must match. The npm `version` hook copies
the package version into the manifest and stages it with the changelog.
`node scripts/sync-version.js` only synchronizes the version locally;
`npm run release` also invokes the existing `postversion` push hook.

Tag-triggered CI uses the same ZIP builder. Both userscripts were audited
for Manifest V3: they contain no extension API calls, background pages,
remote JavaScript, eval, or inline scripts. DOM style insertion and DOM
event listeners remain in the content script; no extra permissions or
service worker are needed.
