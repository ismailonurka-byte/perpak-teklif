"""Master tablolar — dropdown'ları besler. Tek endpoint hepsini döner (cache dostu)."""
from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.db.models import (
    AmbalajSekli, BaskiSonrasi, BaskiTuru, Eklenti, GrafikDurumu, Gramaj,
    KalemTipi, KartonCinsi, OlukluKalite, Renk,
)

router = APIRouter()


@router.get("/all")
def hepsi(db: DbSession, _: CurrentUser):
    """Tüm master verileri tek seferde döner. Frontend bunu cache'ler."""

    def serialize(rows, *, name_attr="ad"):
        return [
            {"kod": r.kod if hasattr(r, "kod") else r.deger, "ad": getattr(r, name_attr, None)}
            for r in rows
        ]

    return {
        "karton_cinsi": [
            {"kod": r.kod, "ad": r.ad} for r in db.query(KartonCinsi).filter_by(aktif=True).order_by(KartonCinsi.sira).all()
        ],
        "gramaj": [
            {"deger": r.deger} for r in db.query(Gramaj).filter_by(aktif=True).order_by(Gramaj.deger).all()
        ],
        "oluklu_kalite": [
            {"kod": r.kod, "tip": r.tip, "aciklama": r.aciklama}
            for r in db.query(OlukluKalite).filter_by(aktif=True).order_by(OlukluKalite.kod).all()
        ],
        "baski_turu": [
            {"kod": r.kod, "ad": r.ad} for r in db.query(BaskiTuru).filter_by(aktif=True).all()
        ],
        "renk": [
            {"kod": r.kod, "ad": r.ad, "hex": r.hex_kod}
            for r in db.query(Renk).filter_by(aktif=True).all()
        ],
        "baski_sonrasi_islem": [
            {"kod": r.kod, "ad": r.ad} for r in db.query(BaskiSonrasi).filter_by(aktif=True).all()
        ],
        "eklenti": [
            {"kod": r.kod, "ad": r.ad} for r in db.query(Eklenti).filter_by(aktif=True).all()
        ],
        "ambalaj_sekli": [
            {"kod": r.kod, "ad": r.ad} for r in db.query(AmbalajSekli).filter_by(aktif=True).all()
        ],
        "grafik_durumu": [
            {"kod": r.kod, "ad": r.ad} for r in db.query(GrafikDurumu).filter_by(aktif=True).all()
        ],
        "kalem_tipi": [
            {
                "kod": r.kod,
                "ad": r.ad,
                "aciklama": r.aciklama,
                "alan_semasi": r.alan_semasi,
                "sira": r.sira,
            }
            for r in db.query(KalemTipi).filter_by(aktif=True).order_by(KalemTipi.sira).all()
        ],
    }
