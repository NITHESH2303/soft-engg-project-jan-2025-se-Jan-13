"""
One-time migration script: Pinecone → Supabase (pgvector)
=========================================================
Fetches all vectors from a Pinecone index and re-inserts them into
Supabase via PgvectorDB. After a successful run this script is no
longer needed and the Pinecone dependency can be removed.

Run from the backend/platform directory:
    poetry run python migrate_pinecone_to_supabase.py
"""

import os
import json
from dotenv import load_dotenv

load_dotenv(override=True)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_HOST = os.getenv("PINECONE_HOST")
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

# ── Sanity checks ──────────────────────────────────────────────────────────────
if not PINECONE_API_KEY:
    raise EnvironmentError("PINECONE_API_KEY is not set in .env")
if not PINECONE_HOST:
    raise EnvironmentError("PINECONE_HOST is not set in .env")
if not SQLALCHEMY_DATABASE_URL:
    raise EnvironmentError("SQLALCHEMY_DATABASE_URL is not set in .env")

# Supabase transaction pooler (port 5432) rejects psycopg2 connections.
# Switch to session-mode pooler (port 6543) for this local script.
if ":5432/" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(":5432/", ":6543/")
    print("ℹ️  Switched Supabase connection to session-mode pooler (port 6543)")


from pinecone import Pinecone
from ai_platform.vectordb.db_pgvector import PgvectorDB


def migrate():
    print("🔌 Connecting to Pinecone...")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(host=PINECONE_HOST)

    # ── 1. List all vector IDs ─────────────────────────────────────────────────
    print("📋 Listing all vectors in the Pinecone index...")
    ids = []
    try:
        for id_batch in index.list():
            ids.extend(id_batch)
    except Exception as e:
        print(f"❌ Failed to list vectors: {e}")
        raise

    if not ids:
        print("⚠️  No vectors found in Pinecone index. Nothing to migrate.")
        return

    print(f"   Found {len(ids)} vector(s): {ids}")

    # ── 2. Fetch full records (vector + metadata) ──────────────────────────────
    print("\n⬇️  Fetching vector records from Pinecone...")
    fetch_response = index.fetch(ids=ids)
    vectors = fetch_response.vectors  # dict: id → {id, values, metadata}

    # ── 3. Inspect and report what we found ───────────────────────────────────
    records_with_text = []
    records_without_text = []

    for vec_id, vec_data in vectors.items():
        metadata = vec_data.metadata or {}
        text = metadata.get("text") or metadata.get("page_content") or metadata.get("content")
        if text:
            records_with_text.append((vec_id, text, metadata))
        else:
            records_without_text.append((vec_id, metadata))

    print(f"   ✅ Records with text: {len(records_with_text)}")
    if records_without_text:
        print(f"   ⚠️  Records WITHOUT text (raw vectors only — cannot migrate): {len(records_without_text)}")
        for vid, meta in records_without_text:
            print(f"      ID={vid}  metadata keys={list(meta.keys())}")

    if not records_with_text:
        print("\n❌ None of the Pinecone records contain text. Cannot migrate to pgvector.")
        print("   → Falling back: consider the dual-backend approach instead.")
        return

    # ── 4. Group by collection (namespace / metadata['collection']) ───────────
    # LangChain stores the collection name in metadata['namespace'] or uses the
    # default namespace. We'll group by the metadata 'namespace' key if present,
    # and fall back to 'general'.
    from collections import defaultdict
    grouped: dict[str, list] = defaultdict(list)

    for vec_id, text, metadata in records_with_text:
        collection = (
            metadata.get("namespace")
            or metadata.get("collection")
            or "general"
        )
        # Strip the text key from metadata passed to pgvector to avoid duplication
        clean_meta = {k: v for k, v in metadata.items() if k not in ("text", "page_content", "content")}
        grouped[collection].append((vec_id, text, clean_meta))

    # ── 5. Insert into Supabase pgvector ──────────────────────────────────────
    total_inserted = 0
    for collection, records in grouped.items():
        print(f"\n💾 Inserting {len(records)} record(s) into Supabase collection '{collection}'...")
        vectordb = PgvectorDB(
            collection_name=collection,
            connection_str=SQLALCHEMY_DATABASE_URL,
        )
        for vec_id, text, meta in records:
            try:
                # Preserve the original Pinecone ID in metadata for traceability
                meta["pinecone_id"] = vec_id
                vectordb.add_text(text=text, metadata=meta)
                print(f"   ✅ Migrated ID={vec_id}")
                total_inserted += 1
            except Exception as e:
                print(f"   ❌ Failed to insert ID={vec_id}: {e}")

    print(f"\n🎉 Migration complete! {total_inserted}/{len(records_with_text)} records inserted into Supabase.")
    if records_without_text:
        print(f"⚠️  {len(records_without_text)} record(s) could NOT be migrated (no text in metadata).")


if __name__ == "__main__":
    migrate()
