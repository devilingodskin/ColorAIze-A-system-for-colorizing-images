"""
Authentication and session management for privacy.
"""
from fastapi import Header, HTTPException
from typing import Optional
import secrets
import string

def generate_session_id() -> str:
    """Generate a secure session ID."""
    # Generate 32-character random session ID
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def get_session_id(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")) -> str:
    """
    Get session ID from header or raise error.
    This ensures every request is associated with a session for privacy.
    
    Args:
        x_session_id: Session ID from X-Session-ID header
        
    Returns:
        Validated session ID
        
    Raises:
        HTTPException: If session ID is missing or invalid
    """
    if not x_session_id:
        raise HTTPException(
            status_code=401,
            detail="Session ID required. Please provide X-Session-ID header."
        )
    
    # Validate session ID format (32 alphanumeric characters)
    if not (len(x_session_id) == 32 and x_session_id.isalnum()):
        raise HTTPException(
            status_code=400,
            detail="Invalid session ID format. Must be 32 alphanumeric characters."
        )
    
    return x_session_id

def verify_image_access(image_session_id: str, request_session_id: str) -> bool:
    """
    Verify that the requesting session has access to the image.
    
    Args:
        image_session_id: Session ID of the image owner
        request_session_id: Session ID from the request
        
    Returns:
        True if access is granted, False otherwise
    """
    return image_session_id == request_session_id

