"""Build an extension ZIP with a root manifest and portable entry paths (Python 3)."""

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parent.parent
source = root / "src"
manifest = json.loads((source / "manifest.json").read_text(encoding="utf-8"))
package = json.loads((root / "package.json").read_text(encoding="utf-8"))
if manifest["manifest_version"] != 3:
    raise ValueError("The extension must use Manifest V3")
if manifest["version"] != package["version"]:
    raise ValueError("Package and manifest versions must match")

archive = root / "dist" / "SNOREAD_CHROME_EXTENSION.zip"
archive.parent.mkdir(exist_ok=True)
with ZipFile(archive, "w", compression=ZIP_DEFLATED) as output:
    for path in sorted(source.rglob("*")):
        if path.is_file():
            output.write(path, arcname=path.relative_to(source).as_posix())
print(archive)
