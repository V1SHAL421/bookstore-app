from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import DBBook, DBAuthor
from src.routes.v1.books.schema import BookCreateInput


class BookRepository:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create(self, data: BookCreateInput) -> DBBook:
        book = DBBook(**data.model_dump())
        self.db_session.add(book)
        await self.db_session.commit()
        await self.db_session.refresh(book)
        return book

    async def retrieve(self, book_id: UUID) -> DBBook:
        stmt = select(DBBook).where(DBBook.id == book_id)
        result = await self.db_session.exec(stmt)
        return result.one()

    async def retrieve_with_author(self, book_id: UUID) -> dict:
        stmt = (
            select(
                DBBook.id,
                DBBook.title,
                DBBook.author_id,
                DBAuthor.name.label("author_name"),
                DBBook.description,
                DBBook.price,
                DBBook.published_date,
            )
            .join(DBAuthor, DBBook.author_id == DBAuthor.id)
            .where(DBBook.id == book_id)
        )
        result = await self.db_session.exec(stmt)
        return result.one()._asdict()

    async def list(self) -> list[dict]:
        stmt = select(
            DBBook.id,
            DBBook.title,
            DBBook.author_id,
            DBAuthor.name.label("author_name"),
            DBBook.description,
            DBBook.price,
            DBBook.published_date
        ).join(DBAuthor, DBBook.author_id == DBAuthor.id)
        result = await self.db_session.exec(stmt)
        return [row._asdict() for row in result.all()]

    async def update(self, book_id: UUID, **kwargs) -> DBBook:
        book = await self.retrieve(book_id)
        for key, value in kwargs.items():
            setattr(book, key, value)
        self.db_session.add(book)
        await self.db_session.commit()
        await self.db_session.refresh(book)
        return book

    async def delete(self, book_id: UUID) -> None:
        book = await self.retrieve(book_id)
        await self.db_session.delete(book)
        await self.db_session.commit()
