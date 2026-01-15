from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import DBAuthor, DBBook
from src.routes.v1.authors.schema import AuthorCreateInput


class AuthorRepository:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create(self, data: AuthorCreateInput) -> DBAuthor:
        author = DBAuthor(**data.model_dump())
        self.db_session.add(author)
        await self.db_session.commit()
        await self.db_session.refresh(author)
        return author

    async def _get_author(self, author_id: UUID) -> DBAuthor:
        stmt = select(DBAuthor).where(DBAuthor.id == author_id)
        result = await self.db_session.exec(stmt)
        return result.one()

    async def retrieve(self, author_id: UUID) -> dict:
        # Get author
        author = await self._get_author(author_id)
        
        # Get books
        books_stmt = select(
            DBBook.id,
            DBBook.title,
            DBBook.author_id,
            DBBook.description,
            DBBook.price,
            DBBook.published_date
        ).where(DBBook.author_id == author_id)
        books_result = await self.db_session.exec(books_stmt)
        books = [row._asdict() for row in books_result.all()]
        
        return {
            "id": author.id,
            "name": author.name,
            "bio": author.bio,
            "books": books
        }

    async def list(self) -> list[DBAuthor]:
        stmt = select(DBAuthor)
        result = await self.db_session.exec(stmt)
        return result.all()

    async def update(self, author_id: UUID, **kwargs) -> DBAuthor:
        author = await self._get_author(author_id)
        for key, value in kwargs.items():
            setattr(author, key, value)
        self.db_session.add(author)
        await self.db_session.commit()
        await self.db_session.refresh(author)
        return author

    async def delete(self, author_id: UUID) -> None:
        author = await self._get_author(author_id)
        # Delete all books by this author
        books_stmt = select(DBBook).where(DBBook.author_id == author_id)
        books_result = await self.db_session.exec(books_stmt)
        books = books_result.all()
        for book in books:
            await self.db_session.delete(book)
        await self.db_session.delete(author)
        await self.db_session.commit()
