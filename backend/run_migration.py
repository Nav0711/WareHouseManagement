import asyncio
import os
from dotenv import load_dotenv
import asyncpg

async def run_migration():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    print(f"Connecting to {db_url.split('@')[1]}...")
    
    conn = await asyncpg.connect(db_url)
    try:
        with open("sql/02_auth.sql", "r") as f:
            sql = f.read()
            await conn.execute(sql)
            print("Migration 02_auth.sql applied successfully!")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
