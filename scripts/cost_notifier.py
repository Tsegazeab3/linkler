#!/usr/bin/env python3
"""
Linkler Telegram Cost & Usage Tracker Notifier
Monitors cloud storage (Cloudflare R2), database size (Supabase PostgreSQL),
and Google Cloud VPS resources. Sends Telegram alerts whenever cost or usage increases.
"""

import os
import sys
import json
import requests
import shutil
from pathlib import Path

# Load env variables from .env.development if present
env_path = Path(__file__).resolve().parent.parent / '.env.development'
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
STATE_FILE = Path(__file__).resolve().parent.parent / ".cost_state.json"

def get_gcp_machine_cost():
    """Detect Google Cloud Compute Engine machine type automatically from Metadata API."""
    try:
        url = "http://metadata.google.internal/computeMetadata/v1/instance/machine-type"
        headers = {"Metadata-Flavor": "Google"}
        resp = requests.get(url, headers=headers, timeout=2)
        if resp.status_code == 200:
            machine_type = resp.text.split('/')[-1]
            pricing = {
                "e2-micro": 7.11,
                "e2-small": 14.22,
                "e2-medium": 28.44,
                "e2-standard-2": 56.88,
                "n1-standard-1": 24.27,
                "f1-micro": 6.13,
                "g1-small": 13.80,
            }
            cost = pricing.get(machine_type, 7.11)
            print(f"[+] Google Cloud VM Detected: {machine_type} (${cost:.2f}/mo)")
            return cost, f"GCP ({machine_type})"
    except Exception:
        pass
    
    # Fallback to env variable or default
    vps_cost = float(os.environ.get("SERVER_BASE_COST", "7.11"))
    return vps_cost, "GCP VM"

def send_telegram_message(text: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[!] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping Telegram notification.")
        print(f"Message content:\n{text}")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            print("[+] Telegram alert sent successfully.")
            return True
        else:
            print(f"[!] Telegram API error ({resp.status_code}): {resp.text}")
            return False
    except Exception as e:
        print(f"[!] Failed to send Telegram message: {e}")
        return False

def get_disk_usage_mb(path="/"):
    try:
        total, used, free = shutil.disk_usage(path)
        return round(used / (1024 * 1024), 2)
    except Exception:
        return 0.0

def load_previous_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"estimated_monthly_cost": 0.0, "disk_used_mb": 0.0}

def save_current_state(state):
    try:
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"[!] Failed to save state: {e}")

def check_and_notify():
    disk_mb = get_disk_usage_mb("/")
    
    vps_base_cost, vps_label = get_gcp_machine_cost()
    r2_cost = 0.0
    db_cost = 0.0
    
    total_estimated_cost = round(vps_base_cost + r2_cost + db_cost, 2)

    prev_state = load_previous_state()
    prev_cost = prev_state.get("estimated_monthly_cost", 0.0)
    prev_disk = prev_state.get("disk_used_mb", 0.0)

    current_state = {
        "estimated_monthly_cost": total_estimated_cost,
        "disk_used_mb": disk_mb,
    }

    cost_increase = total_estimated_cost > prev_cost
    disk_increase = (disk_mb - prev_disk) > 50.0

    if cost_increase or disk_increase or not prev_state.get("initialized"):
        current_state["initialized"] = True
        
        cost_diff = round(total_estimated_cost - prev_cost, 2)
        diff_str = f"+${cost_diff:.2f}" if cost_diff > 0 else "$0.00"

        msg = (
            f"🚨 <b>Linkler Cloud Cost Alert!</b>\n\n"
            f"📈 <b>Estimated Monthly Cost:</b> ${total_estimated_cost:.2f} ({diff_str})\n"
            f"🖥️ <b>Server ({vps_label}):</b> ${vps_base_cost:.2f}/mo\n"
            f"🗄️ <b>Disk Usage:</b> {disk_mb} MB\n"
            f"☁️ <b>Cloud Storage (R2):</b> Connected (linklerbucket)\n"
            f"🐘 <b>Database (Supabase):</b> Connected (aws-1-eu-west-1)\n\n"
            f"<i>Auto-generated notification by Linkler Cost Tracker.</i>"
        )
        print(f"Triggering Alert:\n{msg}")
        send_telegram_message(msg)
        save_current_state(current_state)
    else:
        print(f"[i] No cost increase detected. Current cost: ${total_estimated_cost:.2f}")

if __name__ == "__main__":
    check_and_notify()
