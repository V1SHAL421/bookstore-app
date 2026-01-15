import uuid

from fastapi import Depends, HTTPException
from sqlalchemy.exc import NoResultFound
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import DBAuthor, DBBook
from src.db.operations import get_db_session
from src.routes.v1.authors.repository import AuthorRepository
from src.routes.v1.authors.schema import AuthorCreateInput, AuthorUpdateInput


class AuthorNotFound(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="Author not found")


async def get_author_service(db_session: AsyncSession = Depends(get_db_session)) -> "AuthorService":
    return AuthorService(db_session=db_session)


class AuthorService:
    def __init__(self, db_session: AsyncSession) -> None:
        self.repository = AuthorRepository(db_session=db_session)

    async def create(self, data: AuthorCreateInput) -> dict:
        author = await self.repository.create(data=data)
        return {
            "id": author.id,
            "name": author.name,
            "bio": author.bio,
            "books": []
        }

    async def _get_author(self, author_id: uuid.UUID) -> DBAuthor:
        try:
            return await self.repository._get_author(author_id)
        except NoResultFound as exc:
            raise AuthorNotFound from exc

    async def retrieve(self, author_id: uuid.UUID) -> dict:
        try:
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
            books_result = await self.repository.db_session.exec(books_stmt)
            books = [row._asdict() for row in books_result.all()]
            
            return {
                "id": author.id,
                "name": author.name,
                "bio": author.bio,
                "books": books
            }
        except NoResultFound as exc:
            raise AuthorNotFound from exc

    async def list(self) -> list[dict]:
        authors = await self.repository.list()
        result = []
        for author in authors:
            # Get books for each
            books_stmt = select(
                DBBook.id,
                DBBook.title,
                DBBook.author_id,
                DBBook.description,
                DBBook.price,
                DBBook.published_date
            ).where(DBBook.author_id == author.id)
            books_result = await self.repository.db_session.exec(books_stmt)
            books = [row._asdict() for row in books_result.all()]
            
            result.append({
                "id": author.id,
                "name": author.name,
                "bio": author.bio,
                "books": books
            })
        return result

    async def update(self, author_id: uuid.UUID, data: AuthorUpdateInput) -> dict:
        author = await self._get_author(author_id=author_id)
        updated_author = await self.repository.update(author_id=author.id, **data.model_dump(exclude_unset=True))
        # Get books
        books_stmt = select(
            DBBook.id,
            DBBook.title,
            DBBook.author_id,
            DBBook.description,
            DBBook.price,
            DBBook.published_date
        ).where(DBBook.author_id == updated_author.id)
        books_result = await self.repository.db_session.exec(books_stmt)
        books = [row._asdict() for row in books_result.all()]
        
        return {
            "id": updated_author.id,
            "name": updated_author.name,
            "bio": updated_author.bio,
            "books": books
        }

    async def delete(self, author_id: uuid.UUID) -> None:
        author = await self._get_author(author_id=author_id)
        await self.repository.delete(author_id=author.id)
