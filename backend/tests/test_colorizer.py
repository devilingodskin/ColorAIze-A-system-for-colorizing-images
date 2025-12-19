"""
Tests for colorizer module.
"""
import pytest
from app.colorizer import ImageColorizer, DEOLDIFY_AVAILABLE


@pytest.mark.skipif(not DEOLDIFY_AVAILABLE, reason="DeOldify not available")
def test_colorizer_initialization():
    """Test colorizer initialization."""
    colorizer = ImageColorizer()
    assert colorizer is not None

