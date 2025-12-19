"""
DeOldify image colorization logic.
"""
import os
import torch
from PIL import Image
import io
import base64
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Try to import DeOldify
DEOLDIFY_AVAILABLE = False
try:
    from deoldify import device
    from deoldify.device_id import DeviceId
    from deoldify.visualize import get_image_colorizer
    DEOLDIFY_AVAILABLE = True
except ImportError as e:
    logger.warning(f"DeOldify not available: {e}. Install it to enable colorization.")
except Exception as e:
    logger.warning(f"DeOldify import error: {e}")


class ImageColorizer:
    """Wrapper for DeOldify image colorization."""
    
    def __init__(self, model_path: Optional[str] = None, render_factor: int = 35):
        """
        Initialize the colorizer.
        
        Args:
            model_path: Path to DeOldify model weights. If None, uses default location.
            render_factor: Rendering factor (higher = better quality but slower). Default 35.
        """
        self.render_factor = render_factor
        self.model_path = model_path or os.getenv(
            "DEOLDIFY_MODEL_PATH",
            os.path.join(os.path.dirname(__file__), "../../ml/models/ColorizeArtistic_gen.pth")
        )
        self.colorizer = None
        self.device = None
        
        if DEOLDIFY_AVAILABLE:
            self._initialize_model()
    
    def _initialize_model(self):
        """Initialize DeOldify model."""
        try:
            import torch
            # Set device
            if torch.cuda.is_available():
                self.device = torch.device("cuda")
                device.set(device=DeviceId.GPU0)
            else:
                self.device = torch.device("cpu")
                device.set(device=DeviceId.CPU)
            
            logger.info(f"Using device: {self.device}")
            
            # Check if model file exists
            import os
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"DeOldify model not found at {self.model_path}. "
                    f"Please run: python ml/scripts/download_model.py"
                )
            
            # Initialize colorizer
            self.colorizer = get_image_colorizer(
                artistic=True,
                render_factor=self.render_factor
            )
            
            logger.info("DeOldify model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize DeOldify model: {e}")
            raise
    
    def colorize(self, image_data: bytes, mime_type: str = "image/jpeg") -> tuple[bytes, str]:
        """
        Colorize a black and white image.
        
        Args:
            image_data: Raw image bytes
            mime_type: MIME type of the input image
            
        Returns:
            Tuple of (colorized_image_bytes, output_mime_type)
        """
        if not DEOLDIFY_AVAILABLE:
            raise RuntimeError("DeOldify is not available. Please install it first.")
        
        if self.colorizer is None:
            raise RuntimeError("Colorizer not initialized. Call _initialize_model() first.")
        
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Colorize using DeOldify
            colorized_image = self.colorizer.get_transformed_image(
                image,
                render_factor=self.render_factor
            )
            
            # Convert back to bytes
            output_buffer = io.BytesIO()
            colorized_image.save(output_buffer, format="JPEG", quality=95)
            colorized_bytes = output_buffer.getvalue()
            
            return colorized_bytes, "image/jpeg"
            
        except Exception as e:
            logger.error(f"Colorization failed: {e}")
            raise RuntimeError(f"Failed to colorize image: {str(e)}")
    
    def colorize_from_base64(self, base64_data: str, mime_type: str = "image/jpeg") -> str:
        """
        Colorize image from base64 string and return as base64 data URL.
        
        Args:
            base64_data: Base64 encoded image (with or without data: prefix)
            mime_type: MIME type of the input image
            
        Returns:
            Base64 data URL string
        """
        # Remove data: prefix if present
        if base64_data.startswith("data:"):
            base64_data = base64_data.split(",", 1)[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_data)
        
        # Colorize
        colorized_bytes, output_mime_type = self.colorize(image_bytes, mime_type)
        
        # Encode to base64 data URL
        colorized_base64 = base64.b64encode(colorized_bytes).decode("utf-8")
        return f"data:{output_mime_type};base64,{colorized_base64}"


# Global colorizer instance (lazy initialization)
_colorizer_instance: Optional[ImageColorizer] = None


def get_colorizer() -> ImageColorizer:
    """Get or create the global colorizer instance."""
    global _colorizer_instance
    if _colorizer_instance is None:
        _colorizer_instance = ImageColorizer()
    return _colorizer_instance

