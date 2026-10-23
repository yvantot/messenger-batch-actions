"""Renders Messenger Batch Actions' Chrome Web Store images from the pages in store/source/ with headless Chrome.

    python store/render.py           # the store images
    python store/render.py --icons   # first redraws the extension's icons in assets/icons/ from assets/logo.svg

Writes store/media/: icon-128.png, screenshot-1.png to screenshot-5.png (1280x800), promo-small.png (440x280),
promo-marquee.png (1400x560) and youtube-thumbnail.png (1280x720, for the promo video on YouTube). The screenshots show the real popup (html/index.html) with made-up chats, set
up by store/source/stub.js. Needs Chrome and Pillow. Chrome runs headless in a throwaway profile, so it never
touches the browser you use.
"""
import argparse
import http.server
import pathlib
import subprocess
import tempfile
import threading

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = ROOT / "store" / "media"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
ICON_SIZES = [16, 32, 48, 64, 128, 256]
PAGES = [
    ("screenshot-1", 1280, 800),
    ("screenshot-2", 1280, 800),
    ("screenshot-3", 1280, 800),
    ("screenshot-4", 1280, 800),
    ("screenshot-5", 1280, 800),
    ("promo-small", 440, 280),
    ("promo-marquee", 1400, 560),
    ("youtube-thumbnail", 1280, 720),
]


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves the repository, with the API stand-in (store/source/stub.js) in front of the popup."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/html/index.html":
            page = (ROOT / "html" / "index.html").read_text(encoding="utf-8")
            body = page.replace("<head>", '<head><script src="/store/source/stub.js"></script>', 1).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, *args):
        pass


def shoot(url, out, width, height, transparent=False):
    """Saves a screenshot of `url` at width x height. Small images are drawn in a larger window and cropped, as
    headless Chrome won't make a window smaller than a few hundred pixels."""
    window = (max(width, 800), max(height, 600))
    with tempfile.TemporaryDirectory() as profile:
        args = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--no-first-run",
            "--no-default-browser-check",
            "--force-device-scale-factor=1",
            f"--user-data-dir={profile}",
            f"--window-size={window[0]},{window[1]}",
            "--virtual-time-budget=4000",
            f"--screenshot={out}",
        ]
        if transparent:
            args.append("--default-background-color=00000000")
        subprocess.run(args + [url], check=True, timeout=120, capture_output=True)
    image = Image.open(out)
    if image.size != window:
        raise SystemExit(f"{out} came out {image.size}, not {window[0]}x{window[1]}")
    image = image.crop((0, 0, width, height))
    image = image.convert("RGBA" if transparent else "RGB")
    image.save(out)
    return image


def draw_icons(base):
    """Redraws assets/icons/icon*.png from assets/logo.svg."""
    for size in ICON_SIZES:
        out = ROOT / "assets" / "icons" / f"icon{size}.png"
        shoot(f"{base}/store/source/icon.html?size={size}", out, size, size, transparent=True)
        print(f"  {out.relative_to(ROOT)}")


def store_icon(base):
    """128x128, drawn from the logo, whose tile already leaves the space around it the store asks for."""
    out = MEDIA / "icon-128.png"
    shoot(f"{base}/store/source/icon.html?size=128", out, 128, 128, transparent=True)
    print(f"  {out.relative_to(ROOT)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--icons", action="store_true", help="redraw the extension's icons from assets/logo.svg first")
    options = parser.parse_args()

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    MEDIA.mkdir(parents=True, exist_ok=True)
    try:
        if options.icons:
            print("Icons:")
            draw_icons(base)
        print("Store images:")
        store_icon(base)
        for name, width, height in PAGES:
            out = MEDIA / f"{name}.png"
            shoot(f"{base}/store/source/{name}.html", out, width, height)
            print(f"  {out.relative_to(ROOT)}")
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
