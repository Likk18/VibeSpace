import urllib.request
from PIL import Image
import io
import sys

url = "https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets/Backgrounds/Backgrounds/floors/hardwood/be472cadba550f362e6a59cac14c1220.jpg"

try:
    req = urllib.request.urlopen(url)
    img_bytes = req.read()
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    
    # Calculate average color
    pixels = list(img.getdata())
    n = len(pixels)
    r_avg = sum(p[0] for p in pixels) / n
    g_avg = sum(p[1] for p in pixels) / n
    b_avg = sum(p[2] for p in pixels) / n
    
    print(f"Average color: R={r_avg:.1f}, G={g_avg:.1f}, B={b_avg:.1f}")
    if r_avg > 240 and g_avg > 240 and b_avg > 240:
        print("THE IMAGE IS MOSTLY WHITE!")
    else:
        print("The image is colored.")
except Exception as e:
    print(f"Error: {e}")
