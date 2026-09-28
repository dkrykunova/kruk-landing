# Локальний сервер для рендера візуалів: віддає сторінку й шрифти, POST /save?name=… зберігає PNG.
import http.server, os, re, urllib.parse
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", os.path.join(ROOT, "..", "..", "brand", "content-01"))
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = q.get("name", [""])[0]
        if not re.fullmatch(r"[a-z0-9-]+\.png", name):
            self.send_response(400); self.end_headers(); return
        data = self.rfile.read(int(self.headers["Content-Length"]))
        open(os.path.join(OUT, name), "wb").write(data)
        self.send_response(200); self.send_header("Access-Control-Allow-Origin", "*"); self.end_headers(); self.wfile.write(b"ok")
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", 8123), H).serve_forever()
