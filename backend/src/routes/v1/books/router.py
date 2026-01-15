from uuid import UUID

from fastapi import APIRouter, Depends
from src.db.models import DBUser
from src.routes.v1.books.schema import BookCreateInput, BookOutput, BookUpdateInput
from src.routes.v1.books.service import BookService, get_book_service
from src.utils.auth import authenticate_user

router = APIRouter(prefix="/books", tags=["books"])


@router.post("", response_model=BookOutput, status_code=201)
async def create_book(
    book_input: BookCreateInput,
    book_service: BookService = Depends(get_book_service),
    current_user: DBUser = Depends(authenticate_user),
):
    book = await book_service.create(data=book_input)
    book_with_author = await book_service.retrieve_with_author(book_id=book.id)
    return BookOutput(**book_with_author)


@router.get("", response_model=list[BookOutput])
async def list_books(
    book_service: BookService = Depends(get_book_service),
    current_user: DBUser = Depends(authenticate_user),
):
    books = await book_service.list()
    return [BookOutput(**book) for book in books]


@router.get("/{book_id}", response_model=BookOutput)
async def get_book(
    book_id: UUID,
    book_service: BookService = Depends(get_book_service),
    current_user: DBUser = Depends(authenticate_user),
):
    book = await book_service.retrieve_with_author(book_id=book_id)
    return BookOutput(**book)


@router.patch("/{book_id}", response_model=BookOutput)
async def update_book(
    book_id: UUID,
    update_input: BookUpdateInput,
    book_service: BookService = Depends(get_book_service),
    current_user: DBUser = Depends(authenticate_user),
):
    book = await book_service.update(book_id=book_id, data=update_input)
    book_with_author = await book_service.retrieve_with_author(book_id=book.id)
    return BookOutput(**book_with_author)


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: UUID,
    book_service: BookService = Depends(get_book_service),
    current_user: DBUser = Depends(authenticate_user),
):
    await book_service.delete(book_id=book_id)
