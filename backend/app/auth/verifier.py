import os
from abc import ABC, abstractmethod
from typing import Dict, Any

import firebase_admin
from firebase_admin import auth, credentials
from app.core.config import settings

def initialize_firebase():
    try:
        firebase_admin.get_app()
        return
    except ValueError:
        pass
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    credential_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    if settings.ENVIRONMENT == "production" and (not project_id or not credential_path):
        raise RuntimeError("FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS are required in production.")
    try:
        credential = credentials.Certificate(credential_path) if credential_path else credentials.ApplicationDefault()
        firebase_admin.initialize_app(credential, options={"projectId": project_id} if project_id else None)
    except Exception as exc:
        raise RuntimeError("Firebase Admin credentials could not be initialized.") from exc


class TokenVerifier(ABC):
    @abstractmethod
    def verify_token(self, token: str) -> Dict[str, Any]:
        pass


class FirebaseTokenVerifier(TokenVerifier):
    def verify_token(self, token: str) -> Dict[str, Any]:
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as exc:
            raise ValueError("Invalid authentication token") from exc


class MockTokenVerifier(TokenVerifier):
    def verify_token(self, token: str) -> Dict[str, Any]:
        if token == "mock-valid-token-user1":
            return {
                "uid": "test-uid-1",
                "email": "user1@example.com",
                "name": "Test User 1",
                "picture": "https://example.com/avatar1.png"
            }
        elif token == "mock-valid-token-user2":
            return {
                "uid": "test-uid-2",
                "email": "user2@example.com",
                "name": "Test User 2",
                "picture": "https://example.com/avatar2.png"
            }
        raise ValueError("Invalid mock token")


# Use Mock token verifier if in test environment
is_test = os.getenv("TESTING") == "1" and settings.ENVIRONMENT != "production"
if not is_test:
    initialize_firebase()
token_verifier = MockTokenVerifier() if is_test else FirebaseTokenVerifier()
