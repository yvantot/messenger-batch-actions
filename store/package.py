"""Builds the Chrome Web Store upload zip from the committed files, then checks it.

    python store/package.py   # writes messenger-batch-actions-<version>.zip next to manifest.json

It packs manifest.json, assets/, css/, html/ and js/ from HEAD (so commit first), and leaves out tests/, rules/
(downloaded from GitHub, not shipped), store/ and the docs. Then it checks that every path the manifest names,
and every file the popup page links to, is in the zip exactly as written, and that no manifest path starts with
"./" (the store's upload check rejects those, though Chrome itself doesn't).
"""
import json
import pathlib
import re
import subprocess
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHIPPED = ["manifest.json", "assets", "css", "html", "js"]


def manifest_paths(manifest):
    yield manifest["action"]["default_popup"]
    yield manifest["background"]["service_worker"]
    yield from manifest["icons"].values()
    for script in manifest["content_scripts"]:
        yield from script["js"]


def main():
    if subprocess.run(["git", "status", "--porcelain", "--", *SHIPPED], cwd=ROOT, capture_output=True, text=True).stdout.strip():
        raise SystemExit("Commit the extension's files first: the zip is built from HEAD.")
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    out = ROOT / f"messenger-batch-actions-{manifest['version']}.zip"
    subprocess.run(["git", "archive", "--format=zip", "-o", str(out), "HEAD", *SHIPPED], cwd=ROOT, check=True)

    with zipfile.ZipFile(out) as package:
        names = set(package.namelist())
        problems = []
        for path in manifest_paths(manifest):
            if path.startswith("./") or path.startswith("/"):
                problems.append(f"manifest path {path!r} starts with ./ or /")
            elif path not in names:
                problems.append(f"manifest names {path}, which isn't in the zip")
        popup = manifest["action"]["default_popup"]
        page = package.read(popup).decode("utf-8")
        for link in re.findall(r'(?:src|href)="([^"#?]+)"', page):
            if link.startswith(("http:", "https:", "data:", "mailto:")):
                continue
            target = (pathlib.PurePosixPath(popup).parent / link).as_posix()
            # Resolve ../ the way a browser would
            parts = []
            for part in target.split("/"):
                if part == "..":
                    parts.pop()
                elif part != ".":
                    parts.append(part)
            if "/".join(parts) not in names:
                problems.append(f"{popup} links to {link}, which isn't in the zip")
        if any(name.startswith(("tests/", "rules/", "store/")) for name in names):
            problems.append("the zip has files that shouldn't ship (tests/, rules/ or store/)")

    if problems:
        out.unlink()
        raise SystemExit("Not packaged:\n  " + "\n  ".join(problems))
    print(f"{out.name}: {len(names)} files, {out.stat().st_size // 1024} KB, every path checked")


if __name__ == "__main__":
    main()
