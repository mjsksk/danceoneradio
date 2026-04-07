#!/usr/bin/env python3
"""
Dance One Radio - Local SAM Resolver
=====================================

This script runs on the SAM Broadcaster PC and:
1. Polls Lovable/Supabase for approved song requests needing matching
2. Queries the local SAM MariaDB database (samdb) for best matches
3. Reports matches back to Lovable/Supabase
4. Optionally queues matched tracks in SAM

Requirements:
  pip install requests mysql-connector-python

Configuration:
  Edit the settings below or set environment variables.

Usage:
  python sam-local-resolver.py           # Run once
  python sam-local-resolver.py --loop    # Run continuously (poll every 30s)
  python sam-local-resolver.py --test    # Test DB connection only
"""

import os
import sys
import time
import re
import argparse
import requests

try:
    import mysql.connector
except ImportError:
    print("ERROR: mysql-connector-python not installed.")
    print("Run: pip install mysql-connector-python requests")
    sys.exit(1)

# ─── Configuration ─────────────────────────────────────────────
# Supabase / Lovable API
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "https://upbwlnpycrbhxahjztrf.supabase.co"
)
SAM_API_TOKEN = os.environ.get("SAM_API_TOKEN", "YOUR_SAM_API_TOKEN_HERE")

# Local SAM MariaDB connection
SAM_DB_HOST = os.environ.get("SAM_DB_HOST", "127.0.0.1")
SAM_DB_PORT = int(os.environ.get("SAM_DB_PORT", "3306"))
SAM_DB_USER = os.environ.get("SAM_DB_USER", "root")
SAM_DB_PASS = os.environ.get("SAM_DB_PASS", "")
SAM_DB_NAME = os.environ.get("SAM_DB_NAME", "samdb")

# SAM music root path (for building RELATIVEFILE)
SAM_MUSIC_ROOT = os.environ.get("SAM_MUSIC_ROOT", r"C:\D1Files\Dance Music")

# Poll interval in seconds (only used with --loop)
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "30"))


# ─── Normalization ──────────────────────────────────────────────

def normalize(value):
    """Normalize a string for matching: lowercase, strip punctuation, collapse spaces."""
    if not value:
        return ""
    s = value.lower().strip()
    # Remove file extensions
    s = re.sub(r'\.(mp3|wav|flac|aac|ogg|m4a|wma)$', '', s, flags=re.IGNORECASE)
    # Replace non-alphanumeric with space
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    # Collapse multiple spaces
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def normalize_key(value):
    """Normalize and remove all spaces (for exact key matching)."""
    return normalize(value).replace(' ', '')


# ─── Database ───────────────────────────────────────────────────

def get_sam_connection():
    """Connect to local SAM MariaDB."""
    return mysql.connector.connect(
        host=SAM_DB_HOST,
        port=SAM_DB_PORT,
        user=SAM_DB_USER,
        password=SAM_DB_PASS,
        database=SAM_DB_NAME,
    )


def test_connection():
    """Test the SAM database connection."""
    try:
        conn = get_sam_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM songlist")
        count = cursor.fetchone()[0]
        print(f"OK: Connected to samdb. songlist has {count} tracks.")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"ERROR: Cannot connect to samdb: {e}")
        return False


def find_match(conn, artist, title):
    """
    Query SAM's songlist table for the best match.
    
    SAM Broadcaster typically stores tracks in a 'songlist' table with columns:
      - artist, title, filename, songtype, etc.
    
    Matching priority:
      1. Exact normalized artist + title key match (confidence 100)
      2. Exact normalized title key match (confidence 90) 
      3. Title contains match (confidence 70)
      4. No match (confidence 0)
    
    Returns: dict with match info or None
    """
    cursor = conn.cursor(dictionary=True)
    
    req_artist_key = normalize_key(artist)
    req_title_key = normalize_key(title)
    req_artist_norm = normalize(artist)
    req_title_norm = normalize(title)

    # Fetch candidate tracks from SAM's songlist
    # SAM stores tracks in 'songlist' table - adjust column names if needed
    try:
        cursor.execute("""
            SELECT id, artist, title, filename, filepath, songtype
            FROM songlist
            WHERE songtype IN ('S', 'M', '')
            ORDER BY artist, title
        """)
    except Exception:
        # If songtype column doesn't exist, try without filter
        cursor.execute("""
            SELECT id, artist, title, filename, filepath
            FROM songlist
            ORDER BY artist, title
        """)
    
    tracks = cursor.fetchall()
    cursor.close()

    best_match = None
    best_priority = 999
    best_confidence = 0

    for track in tracks:
        t_artist = track.get('artist', '') or ''
        t_title = track.get('title', '') or ''
        t_filename = track.get('filename', '') or ''
        t_filepath = track.get('filepath', '') or ''
        
        t_artist_key = normalize_key(t_artist)
        t_title_key = normalize_key(t_title)

        priority = None
        confidence = 0

        # Priority 1: Exact artist + title key match
        if req_artist_key and req_title_key:
            if req_artist_key == t_artist_key and req_title_key == t_title_key:
                priority = 1
                confidence = 100

        # Priority 2: Exact title key match (artist differs)
        if priority is None and req_title_key:
            if req_title_key == t_title_key:
                priority = 2
                confidence = 90

        # Priority 3: Title contains
        if priority is None and req_title_key and t_title_key:
            if req_title_key in t_title_key or t_title_key in req_title_key:
                priority = 3
                confidence = 70

        if priority is not None and priority < best_priority:
            best_priority = priority
            best_confidence = confidence
            
            # Build the relative file path
            full_path = t_filepath or t_filename
            relative = make_relative(full_path)
            
            best_match = {
                'matched_artist': t_artist,
                'matched_title': t_title,
                'sam_filename': relative,
                'match_confidence': confidence,
                'match_method': f'local-sam-priority-{priority}',
                'full_path': full_path,
            }
            
            # Priority 1 is the best possible - stop searching
            if priority == 1:
                break

    return best_match


def make_relative(full_path):
    """
    Convert a full file path to a path relative to SAM_MUSIC_ROOT.
    e.g. C:\\D1Files\\Dance Music\\Artist\\Track.mp3 -> Artist\\Track.mp3
    """
    if not full_path:
        return full_path
    
    # Normalize path separators
    normalized_root = SAM_MUSIC_ROOT.replace('/', '\\').rstrip('\\') + '\\'
    normalized_path = full_path.replace('/', '\\')
    
    if normalized_path.lower().startswith(normalized_root.lower()):
        return normalized_path[len(normalized_root):]
    
    return full_path


# ─── API ────────────────────────────────────────────────────────

def fetch_pending_requests():
    """Fetch approved requests needing matching from Lovable."""
    url = f"{SUPABASE_URL}/functions/v1/sam-pending-matches?token={SAM_API_TOKEN}&limit=10"
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code != 200:
            print(f"  API error: {resp.status_code} {resp.text.strip()}")
            return []
        
        text = resp.text.strip()
        if text.startswith("COUNT=0"):
            return []
        
        # Parse the plain-text response
        requests_list = []
        current = {}
        for line in text.split('\n'):
            line = line.strip()
            if line == '---':
                if current.get('id'):
                    requests_list.append(current)
                current = {}
            elif '=' in line:
                key, _, val = line.partition('=')
                if key == 'REQUEST_ID':
                    current['id'] = val
                elif key == 'ARTIST':
                    current['artist'] = val
                elif key == 'TITLE':
                    current['title'] = val
        
        # Don't forget the last one if no trailing ---
        if current.get('id'):
            requests_list.append(current)
        
        return requests_list
    except Exception as e:
        print(f"  Fetch error: {e}")
        return []


def report_match(request_id, match_result):
    """Report a match result back to Lovable."""
    url = f"{SUPABASE_URL}/functions/v1/sam-set-match?token={SAM_API_TOKEN}"
    
    if match_result is None:
        payload = {
            'request_id': request_id,
            'no_match': True,
            'reason': 'No match found in local SAM database',
        }
    else:
        payload = {
            'request_id': request_id,
            'sam_filename': match_result['sam_filename'],
            'matched_artist': match_result['matched_artist'],
            'matched_title': match_result['matched_title'],
            'match_confidence': match_result['match_confidence'],
            'match_method': match_result['match_method'],
        }
    
    try:
        resp = requests.post(url, json=payload, timeout=15)
        return resp.status_code == 200
    except Exception as e:
        print(f"  Report error: {e}")
        return False


# ─── Main ───────────────────────────────────────────────────────

def run_once():
    """Run one matching cycle."""
    print(f"[{time.strftime('%H:%M:%S')}] Checking for pending requests...")
    
    pending = fetch_pending_requests()
    if not pending:
        print("  No pending requests.")
        return
    
    print(f"  Found {len(pending)} pending request(s).")
    
    conn = get_sam_connection()
    
    for req in pending:
        rid = req['id'][:8]
        artist = req.get('artist', '')
        title = req.get('title', '')
        print(f"  Matching: {artist} - {title} (id: {rid}...)")
        
        match = find_match(conn, artist, title)
        
        if match:
            print(f"    MATCH: {match['matched_artist']} - {match['matched_title']}")
            print(f"    File: {match['sam_filename']} (confidence: {match['match_confidence']}%)")
        else:
            print(f"    NO MATCH found.")
        
        ok = report_match(req['id'], match)
        if ok:
            print(f"    Reported to Lovable: OK")
        else:
            print(f"    Reported to Lovable: FAILED")
    
    conn.close()


def main():
    parser = argparse.ArgumentParser(description="Dance One Radio - Local SAM Resolver")
    parser.add_argument('--loop', action='store_true', help='Run continuously')
    parser.add_argument('--test', action='store_true', help='Test DB connection only')
    parser.add_argument('--interval', type=int, default=POLL_INTERVAL, help='Poll interval in seconds')
    args = parser.parse_args()

    if args.test:
        test_connection()
        return

    print("=" * 60)
    print("Dance One Radio - Local SAM Resolver")
    print("=" * 60)
    print(f"  Supabase: {SUPABASE_URL}")
    print(f"  SAM DB:   {SAM_DB_HOST}:{SAM_DB_PORT}/{SAM_DB_NAME}")
    print(f"  Music:    {SAM_MUSIC_ROOT}")
    print()

    if not test_connection():
        print("\nFix the database connection and try again.")
        sys.exit(1)

    if args.loop:
        print(f"\nRunning in loop mode (every {args.interval}s). Press Ctrl+C to stop.\n")
        try:
            while True:
                run_once()
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nStopped.")
    else:
        run_once()


if __name__ == "__main__":
    main()
