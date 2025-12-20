"""
Download DeOldify model weights.
"""
import os
import urllib.request
import ssl
import zipfile
from pathlib import Path
import sys

# Create unverified SSL context for downloading (model files are safe)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

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
    
    # Check file size if exists
    if model_path.exists() and model_path.stat().st_size > 0:
        file_size = model_path.stat().st_size
        print(f"Model {model_name} already exists at {model_path} ({file_size / (1024*1024):.1f} MB)")
        return str(model_path)
    
    # Remove empty file if exists
    if model_path.exists() and model_path.stat().st_size == 0:
        print(f"Removing empty file {model_path}")
        model_path.unlink()
    
    print(f"Downloading {model_name} from {url}...")
    print("This may take 5-15 minutes depending on your internet connection (~1.5 GB)")
    
    try:
        # Use unverified SSL context
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, context=ssl_context) as response:
            total_size = int(response.headers.get('Content-Length', 0))
            downloaded = 0
            chunk_size = 8192  # 8 KB chunks
            
            with open(model_path, 'wb') as out_file:
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    out_file.write(chunk)
                    downloaded += len(chunk)
                    
                    # Show progress
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        mb_downloaded = downloaded / (1024 * 1024)
                        mb_total = total_size / (1024 * 1024)
                        sys.stdout.write(f"\rProgress: {percent:.1f}% ({mb_downloaded:.1f} MB / {mb_total:.1f} MB)")
                        sys.stdout.flush()
                    else:
                        mb_downloaded = downloaded / (1024 * 1024)
                        sys.stdout.write(f"\rDownloaded: {mb_downloaded:.1f} MB")
                        sys.stdout.flush()
            
            print()  # New line after progress
            file_size = model_path.stat().st_size
            print(f"✅ Model downloaded successfully to {model_path} ({file_size / (1024*1024):.1f} MB)")
            return str(model_path)
    except KeyboardInterrupt:
        print("\n\n⚠️  Download interrupted by user")
        if model_path.exists():
            model_path.unlink()
        raise
    except Exception as e:
        print(f"\n❌ Error downloading model: {e}")
        if model_path.exists():
            model_path.unlink()
        raise


if __name__ == "__main__":
    import sys
    
    model_name = sys.argv[1] if len(sys.argv) > 1 else "ColorizeArtistic_gen"
    download_model(model_name)

