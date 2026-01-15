import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.operations import get_db_session
from src.routes.v1.users.schema import UserLoginInput
from src.routes.v1.users.service import UserService
from src.settings import settings
from src.utils.redis import redis_client

security = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: UUID, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "role": role, "exp": expire, "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(user_id: UUID, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "role": role, "exp": expire, "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


async def authenticate_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db_session: AsyncSession = Depends(get_db_session),
):
    token = credentials.credentials

    # Check if token is blacklisted
    blacklist_key = f"blacklist:{token}"
    if await redis_client.get(blacklist_key):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_service = UserService(db_session=db_session)
    user = await user_service.retrieve(user_id=UUID(user_id))

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive")

    return user


async def authenticate_user_login(login_input: UserLoginInput, db_session: AsyncSession = Depends(get_db_session)):
    user_service = UserService(db_session=db_session)

    try:
        user = await user_service.retrieve_by_email(email=login_input.email)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(login_input.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user


async def authenticate_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db_session: AsyncSession = Depends(get_db_session),
):
    user = await authenticate_user(credentials, db_session)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
