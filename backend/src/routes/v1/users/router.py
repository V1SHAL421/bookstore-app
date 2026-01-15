import jwt
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from src.db.models import DBUser
from uuid import UUID
from src.routes.v1.users.schema import RefreshTokenInput, TokenResponse, UserOutput, UserSignUpInput, UserUpdateInput
from src.routes.v1.users.service import UserService, get_user_service
from src.settings import settings
from src.utils.auth import authenticate_user, authenticate_user_login, create_access_token, create_refresh_token, security
from src.utils.redis import redis_client

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/signup", response_model=UserOutput, status_code=201)
async def signup(user_input: UserSignUpInput, user_service: UserService = Depends(get_user_service)):
    user = await user_service.create(data=user_input)
    return UserOutput(**user.model_dump())


@router.post("/login", response_model=TokenResponse)
async def login(response: Response, user: DBUser = Depends(authenticate_user_login)):
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)
    await redis_client.set(
        f"refresh:{user.id}",
        refresh_token,
        ex=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "LOCAL",
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOutput(**user.model_dump()))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    refresh_input: RefreshTokenInput | None = None,
    user_service: UserService = Depends(get_user_service),
):
    refresh_token = refresh_input.refresh_token if refresh_input else None
    if not refresh_token:
        refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    stored_refresh = await redis_client.get(f"refresh:{user_id}")
    if not stored_refresh or stored_refresh != refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await user_service.retrieve(user_id=UUID(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")

    new_access_token = create_access_token(user.id, user.role)
    new_refresh_token = create_refresh_token(user.id, user.role)
    await redis_client.set(
        f"refresh:{user.id}",
        new_refresh_token,
        ex=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "LOCAL",
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token, user=UserOutput(**user.model_dump()))


@router.get("/me", response_model=UserOutput)
async def get_me(current_user: DBUser = Depends(authenticate_user)):
    return UserOutput(**current_user.model_dump())


@router.patch("/me", response_model=UserOutput)
async def update_me(
    update_input: UserUpdateInput,
    current_user: DBUser = Depends(authenticate_user),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.update(user_id=current_user.id, data=update_input)
    return UserOutput(**user.model_dump())


@router.delete("/me", status_code=204)
async def delete_me(
    current_user: DBUser = Depends(authenticate_user), user_service: UserService = Depends(get_user_service)
):
    await user_service.delete(user_id=current_user.id)


@router.post("/logout", status_code=200)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
        exp = payload.get("exp")
        if exp:
            now = int(datetime.now(timezone.utc).timestamp())
            remaining = exp - now
            if remaining > 0:
                await redis_client.set(f"blacklist:{token}", "1", ex=remaining)
    except jwt.JWTError:
        pass  # Invalid token, but still "logout"
    return {"message": "Logged out"}
