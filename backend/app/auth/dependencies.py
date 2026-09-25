from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.auth.verifier import token_verifier
from datetime import datetime
from app.models.entities import utcnow
import logging

security = HTTPBearer()
logger = logging.getLogger(__name__)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> User:
    try:
        token = credentials.credentials
        decoded = token_verifier.verify_token(token)
    except ValueError:
        logger.warning("Firebase token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    firebase_uid = decoded.get("uid")
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing UID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    # Auto-create user
    if not user:
        user = User(
            firebase_uid=firebase_uid,
            email=decoded.get("email", ""),
            display_name=decoded.get("name"),
            avatar_url=decoded.get("picture")
        )
        db.add(user)
    else:
        # Update login time and mutable fields
        user.last_login_at = utcnow()
        if "name" in decoded:
            user.display_name = decoded.get("name")
        if "picture" in decoded:
            user.avatar_url = decoded.get("picture")
            
    db.commit()
    db.refresh(user)
    return user
