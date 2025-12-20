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
            os.path.join(os.path.dirname(__file__), "../../ml/models/ColorizeStable_gen.pth")
        )
        self.colorizer = None
        self.device = None
        
        if DEOLDIFY_AVAILABLE:
            self._initialize_model()
    
    def _initialize_model(self):
        """Initialize DeOldify model."""
        try:
            import torch
            import ssl
            from pathlib import Path
            from .config import BASE_DIR
            
            # Fix SSL certificate issues on macOS
            try:
                import certifi
                import os
                os.environ['SSL_CERT_FILE'] = certifi.where()
                os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
            except ImportError:
                pass
            
            # Fix PyTorch 2.6+ weights_only issue for old model files
            # Monkey patch torch.load to use weights_only=False by default
            original_torch_load = torch.load
            def patched_torch_load(*args, **kwargs):
                if 'weights_only' not in kwargs:
                    kwargs['weights_only'] = False
                return original_torch_load(*args, **kwargs)
            torch.load = patched_torch_load
            
            # Set device
            if torch.cuda.is_available():
                self.device = torch.device("cuda")
                device.set(device=DeviceId.GPU0)
            else:
                self.device = torch.device("cpu")
                device.set(device=DeviceId.CPU)
            
            logger.info(f"Using device: {self.device}")
            
            # Determine root folder (where DeOldify will look for models/)
            # DeOldify expects models in root_folder/models/
            # BASE_DIR is backend/, so project root is one level up
            # But our models are in ml/models/, so root_folder should be ml/
            project_root = BASE_DIR.parent
            root_folder = project_root / "ml"  # DeOldify will look in ml/models/
            
            # Determine which model to use based on filename
            model_name = Path(self.model_path).name
            use_artistic = "Artistic" in model_name or "artistic" in model_name.lower()
            
            # Check if model file exists
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"DeOldify model not found at {self.model_path}. "
                    f"Please run: python ml/scripts/download_model.py"
                )
            
            logger.info(f"Using model: {model_name} (artistic={use_artistic})")
            logger.info(f"Root folder: {root_folder}")
            
            # Create dummy directory if it doesn't exist (required by DeOldify)
            dummy_dir = root_folder / "dummy"
            dummy_dir.mkdir(exist_ok=True)
            # Create a placeholder image file so the directory is not empty
            placeholder = dummy_dir / "placeholder.jpg"
            if not placeholder.exists():
                from PIL import Image
                img = Image.new('RGB', (1, 1), color='white')
                img.save(str(placeholder))
            
            # Suppress fastai warnings about empty datasets (expected for inference)
            import warnings
            warnings.filterwarnings("ignore", message="Your training set is empty")
            warnings.filterwarnings("ignore", message="Your validation set is empty")
            warnings.filterwarnings("ignore", category=UserWarning, module="fastai.data_block")
            
            # Change to root_folder directory so DeOldify can find ./dummy/
            original_cwd = os.getcwd()
            try:
                os.chdir(str(root_folder))
                
                # Initialize colorizer
                # DeOldify looks for models in root_folder/models/ and ./dummy/ relative to cwd
                # Note: Model is already pre-trained, no training needed!
                self.colorizer = get_image_colorizer(
                    root_folder=root_folder,
                    artistic=use_artistic,
                    render_factor=self.render_factor
                )
            finally:
                # Restore original working directory
                os.chdir(original_cwd)
            
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
        
        import tempfile
        from pathlib import Path
        
        # DeOldify's get_transformed_image expects a file path, not a PIL Image
        # So we need to save the image to a temporary file first
        temp_file = None
        try:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_path = Path(temp_file.name)
                # Write image bytes to temp file
                temp_file.write(image_data)
                temp_file.flush()
            
            # Colorize using DeOldify (it will read the file)
            colorized_image = self.colorizer.get_transformed_image(
                temp_path,
                render_factor=self.render_factor
            )
            
            # Convert back to bytes
            output_buffer = io.BytesIO()
            colorized_image.save(output_buffer, format="JPEG", quality=95)
            colorized_bytes = output_buffer.getvalue()
            
            # Clean up temp file
            if temp_path.exists():
                temp_path.unlink()
            
            return colorized_bytes, "image/jpeg"
            
        except Exception as e:
            logger.error(f"Colorization failed: {e}")
            # Clean up temp file on error
            if temp_file and Path(temp_file.name).exists():
                Path(temp_file.name).unlink()
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
        try:
            image_bytes = base64.b64decode(base64_data)
        except Exception as e:
            logger.error(f"Failed to decode base64: {e}")
            raise RuntimeError(f"Invalid base64 data: {str(e)}")
        
        # Colorize using bytes directly
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

