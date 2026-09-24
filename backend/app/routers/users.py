from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.display_name is not None:
        user.display_name = user_update.display_name
    if user_update.avatar_url is not None:
        user.avatar_url = user_update.avatar_url
    
    db.commit()
    db.refresh(user)
    return user
