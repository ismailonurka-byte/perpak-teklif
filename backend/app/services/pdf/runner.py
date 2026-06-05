"""PDF üretimini ayrı süreçte çalıştıran ince sarmalayıcı.

Sadece stdlib import eder; böylece ana uvicorn süreci WeasyPrint'i HİÇ yüklemez.
Bellek tavanı yüksek olan render işi her istekte taze bir süreçte koşar ve biter.
"""
import os
import subprocess
import sys
from pathlib import Path

# .../backend/app/services/pdf/runner.py → parents[3] = backend kökü (app paketinin bulunduğu dizin)
BACKEND_ROOT = Path(__file__).resolve().parents[3]


def render_proforma_pdf_isolated(teklif_id, timeout: int = 60) -> bytes:
    """Verilen teklif id için PDF byte'larını ayrı süreçte üretir.

    Hata olursa alt-sürecin stderr'ini içeren RuntimeError fırlatır
    (gerçek sebep böylece loglarda ve istemcide görünür).
    """
    proc = subprocess.run(
        [sys.executable, "-m", "app.services.pdf.render_cli", str(teklif_id)],
        cwd=str(BACKEND_ROOT),
        capture_output=True,
        timeout=timeout,
        env=os.environ.copy(),
    )
    if proc.returncode != 0:
        err = proc.stderr.decode("utf-8", "replace").strip()
        # Son satır genelde asıl hatadır; çok uzun traceback'i kırp.
        tail = err[-1500:] if err else f"(boş stderr, çıkış kodu {proc.returncode})"
        raise RuntimeError(tail)
    if not proc.stdout:
        raise RuntimeError("PDF alt-süreci boş çıktı döndürdü")
    return proc.stdout
