"""
Load scripts/data/muj-faculty.json into Supabase through the admin-only
`import_faculty` database function.

    python scripts/import-faculty.py <admin email> <admin password>

Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from
.env.local. Safe to re-run: existing teachers are updated, new ones added.
"""

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(__file__).parent / "data" / "muj-faculty.json"


def env() -> dict:
    values = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values


def post(url: str, headers: dict, body: dict) -> dict | int:
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    email, password = sys.argv[1], sys.argv[2]
    config = env()
    base = config["NEXT_PUBLIC_SUPABASE_URL"]
    key = config["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    session = post(f"{base}/auth/v1/token?grant_type=password", {"apikey": key}, {"email": email, "password": password})
    auth = {"apikey": key, "Authorization": f"Bearer {session['access_token']}"}

    rows = json.loads(DATA.read_text(encoding="utf-8"))
    count = post(f"{base}/rest/v1/rpc/import_faculty", auth, {"p_rows": rows})
    print(f"imported {count} of {len(rows)} faculty")


if __name__ == "__main__":
    main()
