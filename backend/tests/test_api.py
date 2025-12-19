"""
Basic API tests.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_list_images_empty():
    """Test listing images when empty."""
    response = client.get("/api/images")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_nonexistent_image():
    """Test getting non-existent image."""
    response = client.get("/api/images/99999")
    assert response.status_code == 404

