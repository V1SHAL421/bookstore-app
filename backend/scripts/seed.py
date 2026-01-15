import asyncio
from datetime import datetime

from sqlmodel import select

from src.db.models import DBAuthor, DBBook, DBUser
from src.db.operations import async_engine, managed_session
from sqlmodel import SQLModel
import bcrypt


async def seed() -> None:
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with managed_session() as session:
        existing_user = await session.exec(select(DBUser).limit(1))
        if not existing_user.first():
            users = [
                DBUser(
                    email="admin@bookdex.test",
                    full_name="Admin User",
                    hashed_password=bcrypt.hashpw("adminpass123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
                    role="admin",
                    is_active=True,
                ),
                DBUser(
                    email="reader@bookdex.test",
                    full_name="Reader User",
                    hashed_password=bcrypt.hashpw("readerpass123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
                    role="user",
                    is_active=True,
                ),
            ]
            session.add_all(users)
            await session.commit()
            print(f"Seeded {len(users)} users.")
        else:
            print("Seed skipped: users already exist.")

        existing_book = await session.exec(select(DBBook).limit(1))
        if existing_book.first():
            print("Seed skipped: books already exist.")
            return

        authors = [
            DBAuthor(
                name="Octavia E. Butler",
                bio="Award-winning science fiction author.",
            ),
            DBAuthor(
                name="Ursula K. Le Guin",
                bio="Pioneer of speculative fiction and social commentary.",
            ),
            DBAuthor(
                name="Haruki Murakami",
                bio="Japanese novelist known for surreal, lyrical stories.",
            ),
        ]
        session.add_all(authors)
        await session.flush()

        books = [
            DBBook(
                title="Kindred",
                author_id=authors[0].id,
                description="A modern classic blending historical fiction and sci-fi.",
                price=14.99,
                published_date=datetime(1979, 6, 1),
            ),
            DBBook(
                title="Parable of the Sower",
                author_id=authors[0].id,
                description="A dystopian novel about resilience and community.",
                price=16.5,
                published_date=datetime(1993, 10, 1),
            ),
            DBBook(
                title="The Dispossessed",
                author_id=authors[1].id,
                description="An ambivalent utopia exploring politics and freedom.",
                price=15.25,
                published_date=datetime(1974, 5, 1),
            ),
            DBBook(
                title="A Wizard of Earthsea",
                author_id=authors[1].id,
                description="A coming-of-age tale set in an archipelago world.",
                price=12.0,
                published_date=datetime(1968, 9, 1),
            ),
            DBBook(
                title="Kafka on the Shore",
                author_id=authors[2].id,
                description="A surreal journey intertwined with myth and memory.",
                price=18.0,
                published_date=datetime(2002, 9, 12),
            ),
            DBBook(
                title="Norwegian Wood",
                author_id=authors[2].id,
                description="A nostalgic story of love and loss in 1960s Tokyo.",
                price=13.5,
                published_date=datetime(1987, 9, 4),
            ),
        ]
        session.add_all(books)
        await session.commit()
        print(f"Seeded {len(books)} books across {len(authors)} authors.")


if __name__ == "__main__":
    asyncio.run(seed())
