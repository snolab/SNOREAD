# Chrome Web Store

Item ID: `bdklagnoakmjndjdnfgfimgailecicjo`

- Public listing (live once review passes): <https://chromewebstore.google.com/detail/bdklagnoakmjndjdnfgfimgailecicjo>
- Dashboard: <https://chrome.google.com/webstore/devconsole/b952b326-9677-4ccf-9ed7-ddce0f28dc4f/bdklagnoakmjndjdnfgfimgailecicjo/edit>
- Publisher ID: `b952b326-9677-4ccf-9ed7-ddce0f28dc4f` (snomiao@gmail.com), shared with Tomato Life

Uploads go through the API; see [build.md](build.md#chrome-web-store-upload).

## History

### 2026-09-27: takedown found, 1.1.4 (Manifest V3) submitted

State found through the API (`--status`):

- Published 1.1.2: `PUBLISHED` at 100%, but `"takenDown": true`. The public page was empty and Chrome's update server returned no version.
- Likely cause: the extension was still Manifest V2. The exact takedown reason is on the dashboard, not in the API.

What was done:

- Migrated to Manifest V3 in `84f0b18`: `manifest_version` 3, `browser_action` → `action`, version 1.1.4, no permissions. Both userscripts were audited: no MV2-only APIs. Tested unpacked in headless Chromium: a local article activates the layout, Escape exits, no exceptions.
- Fixed packaging: `scripts/build.py` writes forward-slash ZIP paths, shared by local builds and CI.
- Renamed the GitHub default branch `master` → `main`.
- Added API uploads (`.github/workflows/chrome-web-store.yml`, `scripts/chrome-web-store.mjs`) in `9c76874` and `db21974`.
- Uploaded 1.1.4 as a draft (`uploadState: SUCCEEDED`), then submitted it with `--submit`.

State after submitting:

| | Version | State |
|---|---|---|
| Submitted | 1.1.4 | `PENDING_REVIEW`, publishes on approval |
| Published | 1.1.2 | `PUBLISHED`, `takenDown: true` |

Open: whether the takedown clears on approval or needs an appeal on the dashboard.
