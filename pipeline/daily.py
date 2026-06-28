"""
Daily orchestrator (called by CI): incremental fetch -> rebuild dataset -> notify.

Local dry-run (no email sent, renders data/public/last_alert.html):
    python pipeline/daily.py --dry-run
CI (sends email if RESEND_API_KEY / SENDGRID_API_KEY present):
    python pipeline/daily.py
"""

import sys

import backfill
import notify
import sectors


def main():
    dry = "--dry-run" in sys.argv
    backfill.backfill()        # fetch any missing trading days up to today
    backfill.build_dataset()   # rebuild dataset.json (+ web/public)
    try:
        sectors.build()        # refresh industry map (non-fatal if source down)
    except Exception as e:
        print("daily: sectors refresh skipped:", e)
    notify.run(dry_run=dry)


if __name__ == "__main__":
    main()
