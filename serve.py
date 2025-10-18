import os
import argparse
from http.server import SimpleHTTPRequestHandler, HTTPServer
import re

class BasePrefixedHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, base="", **kwargs):
        self.base = base.rstrip("/")
        self.root_directory = os.path.abspath(directory or ".")
        super().__init__(*args, **kwargs)

    def translate_path(self, path):
        """
        Only serve files if the URL starts with the base prefix.
        Remove the base prefix before mapping to the local filesystem.
        """
        path = path.split("?", 1)[0].split("#", 1)[0]

        if not path.startswith(self.base + "/") and path != self.base:
            return None

        if path.startswith(self.base):
            path = path[len(self.base):]

        path = path.lstrip("/")
        full_path = os.path.join(self.root_directory, path)

        if os.path.isdir(full_path):
            full_path = os.path.join(full_path, "index.html")
        return full_path

    def do_GET(self):
        path = self.translate_path(self.path)
        if path is None or not os.path.isfile(path):
            self.send_error(404, "File not found")
            return

        # --------- HTML Handling ---------
        if path.endswith(".html") and self.base:
            with open(path, "rb") as f:
                content = f.read().decode("utf-8")

            base_tag = f'<base href="{self.base}/">'
            if re.search(r'<base\s+href=["\']/["\']\s*/?>', content, flags=re.IGNORECASE):
                content = re.sub(
                    r'<base\s+href=["\']/["\']\s*/?>',
                    base_tag,
                    content,
                    count=1,
                    flags=re.IGNORECASE
                )
            elif "<head>" in content.lower():
                head_match = re.search(r'<head.*?>', content, re.IGNORECASE)
                if head_match:
                    idx = head_match.end()
                    content = content[:idx] + base_tag + content[idx:]
            else:
                content = base_tag + content

            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.send_header("Content-length", str(len(content.encode("utf-8"))))
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
            return

        # --------- JS Handling ---------
        if path.endswith(".js") and self.base:
            with open(path, "rb") as f:
                content = f.read().decode("utf-8")

            # Replace basePathname
            content = re.sub(
                r"(basePathname\s*:\s*)['\"/]+",
                fr"\1'{self.base}/'",
                content,
                flags=re.IGNORECASE
            )

            self.send_response(200)
            self.send_header("Content-type", "application/javascript")
            self.send_header("Content-length", str(len(content.encode("utf-8"))))
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
            return

        # --------- Other files ---------
        self.send_response(200)
        ctype = self.guess_type(path)
        self.send_header("Content-type", ctype)
        self.send_header("Content-length", os.path.getsize(path))
        self.end_headers()
        with open(path, "rb") as f:
            self.wfile.write(f.read())


def main():
    parser = argparse.ArgumentParser(description="HTTP server serving files only under a base prefix")
    parser.add_argument("--dir", default=".", help="Directory to serve (default: current directory)")
    parser.add_argument("--port", type=int, default=8000, help="Port to serve on (default: 8000)")
    parser.add_argument("--base", required=True, help="Base prefix for URLs (e.g., /path)")
    args = parser.parse_args()

    handler = lambda *a, **kw: BasePrefixedHTTPRequestHandler(
        *a, directory=args.dir, base=args.base, **kw
    )
    server = HTTPServer(("0.0.0.0", args.port), handler)

    print(f"🚀 Serving {args.dir} at http://localhost:{args.port}{args.base}/ only")
    server.serve_forever()


if __name__ == "__main__":
    main()
