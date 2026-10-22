"""Records the demo video for the Chrome Web Store and YouTube from store/video/demo.html.

    python store/video/record.py           # writes store/video/demo.mp4 (1920x1080, 30 fps, H.264, no sound)
    python store/video/record.py --serve   # serves the demo at http://127.0.0.1:8770/store/video/demo.html

The demo plays on a fake clock that moves one frame (1/30 s) per screenshot, so every frame is sharp and the
timing is exact however slow the machine is. Needs the playwright and imageio-ffmpeg Python packages (with
Playwright's Chromium). The browser is headless and has its own profile, so it never touches the one you use.
"""
import argparse
import http.server
import pathlib
import subprocess
import threading
from datetime import datetime, timedelta

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "store" / "video" / "demo.mp4"
FPS = 30
MAX_SECONDS = 120


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves the repository, with the API stand-in (popup-stub.js) in front of the popup."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path.split("?")[0] == "/html/index.html":
            page = (ROOT / "html" / "index.html").read_text(encoding="utf-8")
            body = page.replace("<head>", '<head><script src="/store/video/popup-stub.js"></script>', 1).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, *args):
        pass


def record(base):
    encoder = subprocess.Popen(
        [
            imageio_ffmpeg.get_ffmpeg_exe(),
            "-y",
            "-loglevel", "error",
            "-f", "image2pipe",
            "-framerate", str(FPS),
            "-c:v", "png",
            "-i", "-",
            "-c:v", "libx264",
            "-preset", "slow",
            "-crf", "16",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(OUT),
        ],
        stdin=subprocess.PIPE,
    )
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1.5)
        # Paused, the clock only moves when run_for() moves it: one frame per screenshot
        start = datetime(2026, 10, 22, 12, 0, 0)
        context.clock.install(time=start)
        context.clock.pause_at(start + timedelta(seconds=1))
        page = context.new_page()
        page.goto(f"{base}/store/video/demo.html", wait_until="load")
        frames = 0
        finished_at = None
        while frames < MAX_SECONDS * FPS:
            encoder.stdin.write(page.screenshot(type="png"))
            frames += 1
            # One frame of time, in whole milliseconds that add up to exactly 1000 per second
            context.clock.run_for(round(frames * 1000 / FPS) - round((frames - 1) * 1000 / FPS))
            if frames % FPS == 0:
                print(f"  {frames // FPS}s", flush=True)
                if finished_at is None and page.evaluate("window.demo_finished === true"):
                    finished_at = frames
            if finished_at is not None:
                break
        captions = page.evaluate("window.caption_times")
        browser.close()
    encoder.stdin.close()
    encoder.wait()
    print(f"{OUT.relative_to(ROOT)}: {frames / FPS:.1f}s")
    print("Captions:")
    for caption in captions:
        second = int(caption["second"])
        print(f"  {second // 60}:{second % 60:02d} {caption['text']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--serve", action="store_true", help="serve the demo to watch it in a browser instead")
    options = parser.parse_args()

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 8770 if options.serve else 0), Handler)
    base = f"http://127.0.0.1:{server.server_address[1]}"
    if options.serve:
        print(f"{base}/store/video/demo.html")
        server.serve_forever()
        return
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        record(base)
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
