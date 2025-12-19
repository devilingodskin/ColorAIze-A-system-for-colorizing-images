"""
Download DeOldify model weights.
"""
import os
import urllib.request
import zipfile
from pathlib import Path

MODEL_URLS = {
    "ColorizeArtistic_gen": "https://data.deepai.org/deoldify/ColorizeArtistic_gen.pth",
    "ColorizeStable_gen": "https://data.deepai.org/deoldify/ColorizeStable_gen.pth",
}

MODELS_DIR = Path(__file__).parent.parent / "models"


def download_model(model_name: str = "ColorizeArtistic_gen"):
    """
    Download DeOldify model weights.
    
    Args:
        model_name: Name of the model to download (ColorizeArtistic_gen or ColorizeStable_gen)
    """
    if model_name not in MODEL_URLS:
        raise ValueError(f"Unknown model: {model_name}. Available: {list(MODEL_URLS.keys())}")
    
    # Create models directory if it doesn't exist
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    model_path = MODELS_DIR / f"{model_name}.pth"
    
    if model_path.exists():
        print(f"Model {model_name} already exists at {model_path}")
        return str(model_path)
    
    url = MODEL_URLS[model_name]
    print(f"Downloading {model_name} from {url}...")
    
    try:
        urllib.request.urlretrieve(url, model_path)
        print(f"Model downloaded successfully to {model_path}")
        return str(model_path)
    except Exception as e:
        print(f"Error downloading model: {e}")
        raise


if __name__ == "__main__":
    import sys
    
    model_name = sys.argv[1] if len(sys.argv) > 1 else "ColorizeArtistic_gen"
    download_model(model_name)

