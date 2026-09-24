import os
from abc import ABC, abstractmethod
from typing import Dict, Any

import firebase_admin
from firebase_admin import auth

# Initialize firebase app
# It uses GOOGLE_APPLICATION_CREDENTIALS automatically if set.
if not firebase_admin._apps:
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    if project_id:
        firebase_admin.initialize_app(options={'projectId': project_id})
    else:
        firebase_admin.initialize_app()


class TokenVerifier(ABC):
    @abstractmethod
    def verify_token(self, token: str) -> Dict[str, Any]:
        pass


class FirebaseTokenVerifier(TokenVerifier):
    def verify_token(self, token: str) -> Dict[str, Any]:
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid authentication token: {str(e)}")


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
is_test = os.getenv("TESTING") == "1"
token_verifier = MockTokenVerifier() if is_test else FirebaseTokenVerifier()
