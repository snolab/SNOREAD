// Upload dist/SNOREAD_CHROME_EXTENSION.zip to the Chrome Web Store, then submit it for review.
// Build the zip first with `npm run build`.
//
//   node scripts/chrome-web-store.mjs              upload and submit for review
//   node scripts/chrome-web-store.mjs --no-publish upload only (stays a draft)
//   node scripts/chrome-web-store.mjs --status     print the item's status, change nothing
//   node scripts/chrome-web-store.mjs --submit     submit the already-uploaded draft for review
//
// Auth: CWS_SERVICE_ACCOUNT_KEY (the service account's JSON key), or CWS_ACCESS_TOKEN.
// The service account tomato-life-cws@snomiao.iam.gserviceaccount.com is registered
// under Account in the Web Store developer dashboard.

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

const PUBLISHER = "b952b326-9677-4ccf-9ed7-ddce0f28dc4f";
const ITEM = "bdklagnoakmjndjdnfgfimgailecicjo";
const ZIP = "dist/SNOREAD_CHROME_EXTENSION.zip";
const API = `https://chromewebstore.googleapis.com/v2/publishers/${PUBLISHER}/items/${ITEM}`;
const UPLOAD = `https://chromewebstore.googleapis.com/upload/v2/publishers/${PUBLISHER}/items/${ITEM}:upload`;

async function accessToken() {
    if (process.env.CWS_ACCESS_TOKEN) return process.env.CWS_ACCESS_TOKEN;
    const raw = process.env.CWS_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error("set CWS_SERVICE_ACCOUNT_KEY (service account JSON key) or CWS_ACCESS_TOKEN");
    const key = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
        iss: key.client_email,
        scope: "https://www.googleapis.com/auth/chromewebstore",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
    })}`;
    const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: `${unsigned}.${signature}`,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`token: ${res.status} ${JSON.stringify(json)}`);
    return json.access_token;
}

async function call(token, url, init = {}) {
    const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${init.method ?? "GET"} ${url}: ${res.status} ${JSON.stringify(json)}`);
    return json;
}

const token = await accessToken();

if (process.argv.includes("--status")) {
    console.log("status:", JSON.stringify(await call(token, `${API}:fetchStatus`), null, 2));
    process.exit(0);
}

if (process.argv.includes("--submit")) {
    console.log("publish:", JSON.stringify(await call(token, `${API}:publish`, { method: "POST" })));
    process.exit(0);
}

const { version } = JSON.parse(await readFile("src/manifest.json", "utf8"));
console.log(`uploading ${ZIP} (version ${version})`);

let upload = await call(token, UPLOAD, { method: "POST", body: await readFile(ZIP) });
console.log("upload:", JSON.stringify(upload));
// Uploads are processed asynchronously; poll until they leave IN_PROGRESS
for (let i = 0; JSON.stringify(upload).includes("IN_PROGRESS"); i++) {
    if (i >= 30) throw new Error("upload still in progress after 5 minutes");
    await new Promise((r) => setTimeout(r, 10_000));
    upload = await call(token, `${API}:fetchStatus`);
    console.log("status:", JSON.stringify(upload));
}
if (JSON.stringify(upload).includes("FAIL")) throw new Error("upload failed");

if (process.argv.includes("--no-publish")) {
    console.log("uploaded as a draft; not submitted (--no-publish)");
} else {
    const publish = await call(token, `${API}:publish`, { method: "POST" });
    console.log("publish:", JSON.stringify(publish));
}
