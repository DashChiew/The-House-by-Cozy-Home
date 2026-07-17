"""
Production DB initialization script — runs on Render during build.
Only creates tables if they don't exist. Does NOT drop or seed data.
Safe to run on every deploy.
"""
import sys
from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()
    print("[OK] Database tables created (if not already existing).")
