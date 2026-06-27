from PIL import Image
import os

gallery_dir = r"d:\Sham\Office\Software\3d-website\contemproary-website\novora-website\assets\img\gallery"

for file in sorted(os.listdir(gallery_dir)):
    if file.endswith('.webp'):
        path = os.path.join(gallery_dir, file)
        with Image.open(path) as img:
            print(f"{file}: {img.width}x{img.height} (Aspect ratio: {img.width/img.height:.2f})")
