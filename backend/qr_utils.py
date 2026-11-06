import re
from typing import List, Dict

try:
    import cv2
    import numpy as np
except Exception:
    cv2 = None
    np = None


def classify_qr_kind(data: str) -> str:
    cleaned = (data or "").strip()
    lower = cleaned.lower()
    if lower.startswith(("http://", "https://", "ftp://", "www.")) or re.match(r"^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(/.*)?$", cleaned):
        return "url"
    if lower.startswith("tel:") or re.match(r"^(\+?[0-9\s\-()]{7,20})$", cleaned):
        return "phone"
    if cleaned.upper().startswith("WIFI:"):
        return "wifi"
    return "text"


def decode_qr_codes(image_bytes: bytes) -> List[Dict[str, str]]:
    """
    Decodes QR codes from raw image bytes using OpenCV (cv2.QRCodeDetector).
    Returns list of dicts: [{"data": str, "kind": "url" | "phone" | "wifi" | "text"}]
    Handles no-QR, blurry, or invalid images by returning [] and never raising.
    """
    if not image_bytes or not isinstance(image_bytes, (bytes, bytearray)):
        return []

    try:
        if cv2 is None or np is None:
            return []

        # Convert bytes to numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        if np_arr is None or len(np_arr) == 0:
            return []

        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return []

        detector = cv2.QRCodeDetector()
        results: List[Dict[str, str]] = []

        # Attempt multi-detection first if available
        if hasattr(detector, "detectAndDecodeMulti"):
            ok, decoded_info, _, _ = detector.detectAndDecodeMulti(img)
            if ok and decoded_info is not None:
                for text in decoded_info:
                    val = (text or "").strip()
                    if val and not any(r["data"] == val for r in results):
                        results.append({
                            "data": val,
                            "kind": classify_qr_kind(val),
                        })

        # Fallback to single detector if nothing was found with multi
        if not results:
            val, _, _ = detector.detectAndDecode(img)
            val = (val or "").strip()
            if val:
                results.append({
                    "data": val,
                    "kind": classify_qr_kind(val),
                })

        # Try grayscale if still nothing found
        if not results:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            val, _, _ = detector.detectAndDecode(gray)
            val = (val or "").strip()
            if val:
                results.append({
                    "data": val,
                    "kind": classify_qr_kind(val),
                })

        return results
    except Exception:
        # Never raise under any circumstances
        return []
