import asyncio
from sqlalchemy import text
from app.db.session import engine

async def run():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE movies ADD COLUMN poster_url VARCHAR;"))
            print("Successfully added poster_url to movies table.")
        except Exception as e:
            print(f"Error (maybe column already exists): {e}")

if __name__ == "__main__":
    asyncio.run(run())
