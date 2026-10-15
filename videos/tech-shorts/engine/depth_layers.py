# usage: DEPTH_DIR/venv/bin/python -I depth_layers.py DEPTH_DIR IMAGE OUTPREFIX
# Splits a still into three parallax layers with Depth Anything V2 (small, ONNX):
#   OUTPREFIX.l0.png  background, with the mid and near areas filled from their surroundings
#   OUTPREFIX.l1.png  middle distance (alpha), with the near area filled
#   OUTPREFIX.l2.png  foreground (alpha)
# Set up DEPTH_DIR once with engine/setup_depth.sh.
import sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
d, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
img = Image.open(src).convert("RGB"); W, H = img.size
# depth at ~518 px on the short side, snapped to multiples of 14 as the model needs
s = 518 / min(W, H); mw, mh = max(14, round(W * s / 14) * 14), max(14, round(H * s / 14) * 14)
x = (np.asarray(img.resize((mw, mh), Image.BICUBIC), np.float32) / 255 - [.485, .456, .406]) / [.229, .224, .225]
dep = ort.InferenceSession(f"{d}/model_q.onnx").run(None, {"pixel_values": x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
dep = (dep - dep.min()) / (np.ptp(dep) + 1e-6)  # relative inverse depth: 1 = nearest
dep = np.asarray(Image.fromarray((dep * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
def mask(th, feather):  # soft mask of everything nearer than the threshold
    return np.clip((dep - th) / feather + .5, 0, 1)
near, mid = mask(np.percentile(dep, 74), .06), mask(np.percentile(dep, 42), .06)
a = np.asarray(img, np.float32)
def fill(m):  # replace the masked area with a normalised blur of what surrounds it (cheap inpainting)
    keep = (1 - m)[..., None]; sm = (W // 4, H // 4)
    num = Image.fromarray(np.clip(a * keep, 0, 255).astype(np.uint8)).resize(sm, Image.BILINEAR).filter(ImageFilter.GaussianBlur(18))
    den = Image.fromarray((keep[..., 0] * 255).astype(np.uint8)).resize(sm, Image.BILINEAR).filter(ImageFilter.GaussianBlur(18))
    f = np.asarray(num.resize((W, H), Image.BILINEAR), np.float32) / np.maximum(np.asarray(den.resize((W, H), Image.BILINEAR), np.float32)[..., None] / 255, .02)
    m2 = np.clip(m * 1.4, 0, 1)[..., None]  # grow slightly so edges never show the subject's ghost
    return np.clip(a * (1 - m2) + f * m2, 0, 255)
def save(rgb, alpha, path):
    rgba = np.dstack([rgb, (alpha * 255) if alpha is not None else np.full((H, W), 255.)]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(path, optimize=True)
save(fill(mid), None, f"{out}.l0.png"); save(fill(near), mid, f"{out}.l1.png"); save(a, near, f"{out}.l2.png")
print(out, W, H)
