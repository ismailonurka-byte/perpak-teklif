from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1 import auth, kullanici, firma, teklif, master, hesaplama, fiyat, rapor


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(kullanici.router, prefix="/api/v1/kullanici", tags=["kullanici"])
app.include_router(firma.router, prefix="/api/v1/firma", tags=["firma"])
app.include_router(teklif.router, prefix="/api/v1/teklif", tags=["teklif"])
app.include_router(master.router, prefix="/api/v1/master", tags=["master"])
app.include_router(hesaplama.router, prefix="/api/v1/hesaplama", tags=["hesaplama"])
app.include_router(fiyat.router, prefix="/api/v1/fiyat", tags=["fiyat"])
app.include_router(rapor.router, prefix="/api/v1/rapor", tags=["rapor"])


@app.get("/health")
def health():
    return {"status": "ok"}


# ─── STATIC FRONTEND (production deploy için) ────────────────────────────
# frontend build edilip backend/static/ klasörüne kopyalandıysa onu serve et.
# Yoksa kök "/" sadece API ipucu döner.

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.exists() and (STATIC_DIR / "index.html").exists():
    # Asset'ler (JS, CSS, resimler)
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/")
    def root_index():
        return FileResponse(STATIC_DIR / "index.html")

    # SPA fallback — React Router'ın iç rotaları (/, /teklifler/123 vs.) için
    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        # API yollarını es geç (zaten /api/v1/ ile başlıyor)
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return {"detail": "Not Found"}
        # Logo, favicon vs.
        target = STATIC_DIR / full_path
        if target.is_file():
            return FileResponse(target)
        # SPA: her şey index.html'e
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def root_api():
        return {"app": settings.APP_NAME, "version": "0.1.0", "docs": "/docs"}
