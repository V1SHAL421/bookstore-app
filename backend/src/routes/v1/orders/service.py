from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException
from sqlalchemy.exc import NoResultFound
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import DBOrder
from src.db.operations import get_db_session
from src.routes.v1.orders.repository import OrderRepository
from src.routes.v1.orders.schema import OrderCreateInput, OrderUpdateInput


class OrderNotFound(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="Order not found")


async def get_order_service(db_session: AsyncSession = Depends(get_db_session)) -> "OrderService":
    return OrderService(db_session=db_session)


class OrderService:
    def __init__(self, db_session: AsyncSession) -> None:
        self.repository = OrderRepository(db_session=db_session)

    async def create(self, data: OrderCreateInput, user_id: uuid.UUID) -> DBOrder:
        return await self.repository.create(user_id=user_id, data=data)

    async def retrieve(self, order_id: uuid.UUID) -> DBOrder:
        try:
            return await self.repository.retrieve(order_id=order_id)
        except NoResultFound as exc:
            raise OrderNotFound from exc

    async def retrieve_by_user(self, order_id: uuid.UUID, user_id: uuid.UUID) -> DBOrder:
        try:
            return await self.repository.retrieve_by_user(user_id=user_id, order_id=order_id)
        except NoResultFound as exc:
            raise OrderNotFound from exc

    async def list(self) -> list[DBOrder]:
        return await self.repository.list()

    async def list_by_user(self, user_id: uuid.UUID) -> list[DBOrder]:
        return await self.repository.list_by_user(user_id=user_id)

    async def update(self, order_id: uuid.UUID, user_id: uuid.UUID, data: OrderUpdateInput) -> DBOrder:
        try:
            return await self.repository.update(user_id=user_id, order_id=order_id, **data.model_dump(exclude_unset=True))
        except NoResultFound as exc:
            raise OrderNotFound from exc

    async def delete(self, order_id: uuid.UUID, user_id: uuid.UUID) -> None:
        try:
            await self.repository.delete(user_id=user_id, order_id=order_id)
        except NoResultFound as exc:
            raise OrderNotFound from exc
