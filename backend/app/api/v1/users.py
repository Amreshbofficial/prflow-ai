from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.models.domain import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_current_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    body: PasswordChange,
    current_user: User = Depends(deps.get_current_user),
):
    # Verify current password
    if not security.verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Validate new password
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )

    current_user.password_hash = security.get_password_hash(body.new_password)
    db.add(current_user)
    db.commit()
    return {"success": True, "message": "Password updated successfully"}
