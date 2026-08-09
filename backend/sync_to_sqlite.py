#!/home/tsega/linkler/venv/bin/python3
import os
import sys
import json
import decimal
import datetime
import psycopg2
import sqlite3
from pathlib import Path

# Register custom adapters for SQLite
sqlite3.register_adapter(decimal.Decimal, lambda d: float(d))
sqlite3.register_adapter(list, lambda l: json.dumps(l))
sqlite3.register_adapter(dict, lambda d: json.dumps(d))
sqlite3.register_adapter(datetime.date, lambda d: d.isoformat())
sqlite3.register_adapter(datetime.datetime, lambda dt: dt.isoformat())

# Paths
backend_dir = Path(__file__).resolve().parent
sqlite_db = backend_dir / 'db.sqlite3'

# Read Supabase credentials from .env.production
env_prod = backend_dir.parent / '.env.production'
env_vars = {}
if env_prod.exists():
    with open(env_prod) as f:
        for line in f:
            if line.strip() and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env_vars[k.strip()] = v.strip().strip('"').strip("'")

pg_host = env_vars.get('POSTGRES_HOST', 'aws-1-eu-west-1.pooler.supabase.com')
pg_db = env_vars.get('POSTGRES_DB', 'linklerdb')
pg_user = env_vars.get('POSTGRES_USER', 'tsegazeab.mqeoqbbpuhzdwjgnjzzo')
pg_pass = env_vars.get('POSTGRES_PASSWORD', 'Abebebesobela424*')
pg_port = int(env_vars.get('POSTGRES_PORT', '5432'))

print(f"[+] Connecting to Supabase PostgreSQL ({pg_host})...")
pg_conn = psycopg2.connect(
    host=pg_host,
    database=pg_db,
    user=pg_user,
    password=pg_pass,
    port=pg_port
)
pg_cur = pg_conn.cursor()

print(f"[+] Connecting to Local SQLite ({sqlite_db})...")
sqlite_conn = sqlite3.connect(sqlite_db)
sqlite_cur = sqlite_conn.cursor()

# Get list of user tables in SQLite
sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
tables = [row[0] for row in sqlite_cur.fetchall()]

# Order of tables to copy to prevent FK issues
tables_to_copy = [
    'accounts_customuser',
    'accounts_follow',
    'accounts_travelerprofile',
    'accounts_verificationdocument',
    'accounts_passwordresettoken',
    'accounts_experience',
    'accounts_experienceimage',
    'accounts_experiencereview',
    'accounts_experiencesave',
    'accounts_providerreview',
    'accounts_booking',
    'accounts_notification',
    'accounts_guideavailability',
    'posts_post',
    'posts_postimage',
    'posts_trip',
    'posts_comment',
    'posts_like',
    'posts_save',
    'discovery_promotion',
    'discovery_promotionimage',
    'chat_conversation',
    'chat_message',
]

for table in tables_to_copy:
    if table not in tables:
        continue
    try:
        # Get column names for table from SQLite
        sqlite_cur.execute(f"PRAGMA table_info({table});")
        columns = [col[1] for col in sqlite_cur.fetchall()]
        col_str = ", ".join([f'"{c}"' for c in columns])
        placeholders = ", ".join(["?"] * len(columns))

        # Query PostgreSQL for matching columns
        pg_cur.execute(f'SELECT {col_str} FROM "{table}";')
        rows = pg_cur.fetchall()

        if rows:
            # Delete existing local rows to avoid primary key conflicts
            sqlite_cur.execute(f'DELETE FROM "{table}";')
            insert_sql = f'INSERT INTO "{table}" ({col_str}) VALUES ({placeholders});'
            sqlite_cur.executemany(insert_sql, rows)
            print(f" [+] Synced {len(rows)} rows into {table}")
    except Exception as e:
        print(f" [!] Error on table {table}: {e}")

sqlite_conn.commit()
pg_conn.close()
sqlite_conn.close()

print("\n🎉 SUCCESS: All production data successfully dumped into local SQLite database!")
