"""Postgres veritabanından SQLite'a tam veri aktarımı.

Çalıştırmadan önce:
  - Postgres çalışıyor olmalı
  - .env'de DATABASE_URL hala Postgres'i göstermeli
  - SQLite dosyası yoksa otomatik yaratılır

Sonrasında .env'i SQLite'a çevirip alembic upgrade head çalıştır.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import (
    AmbalajSekli, BaskiSonrasi, BaskiTuru, BirimFiyatGenel, BirimFiyatOfset,
    Eklenti, Firma, GecisCarpan, GrafikDurumu, Gramaj, KalemTipi, KartonCinsi,
    Kullanici, OlukluKalite, Renk, Teklif, TeklifDurumLog, TeklifKalem,
)
from app.db.session import Base


POSTGRES_URL = "postgresql+psycopg://perpak:perpak@localhost:5432/perpak_teklif"
SQLITE_PATH = Path(__file__).resolve().parents[1] / "perpak.db"
SQLITE_URL = f"sqlite:///{SQLITE_PATH}"


# Aktarılacak tablolar — bağımlılık sırasına göre (önce FK olmayanlar)
TABLOLAR = [
    Kullanici, Firma,
    KartonCinsi, Gramaj, OlukluKalite, BaskiTuru, Renk,
    BaskiSonrasi, Eklenti, AmbalajSekli, GrafikDurumu,
    BirimFiyatOfset, GecisCarpan, BirimFiyatGenel,
    KalemTipi,
    Teklif, TeklifKalem, TeklifDurumLog,
]


def kayit_to_dict(obj):
    """SQLAlchemy ORM objesini ham dict'e çevir."""
    return {
        c.name: getattr(obj, c.name)
        for c in obj.__table__.columns
    }


def main():
    src_engine = create_engine(POSTGRES_URL)
    dst_engine = create_engine(SQLITE_URL)

    # SQLite schema'sını sıfırdan kur
    print(f"📁 SQLite dosyası: {SQLITE_PATH}")
    if SQLITE_PATH.exists():
        SQLITE_PATH.unlink()
        print("   (eski dosya silindi)")
    Base.metadata.create_all(dst_engine)
    print("   ✓ Şema kuruldu")

    SrcSession = sessionmaker(bind=src_engine)
    DstSession = sessionmaker(bind=dst_engine)
    src = SrcSession()
    dst = DstSession()

    toplam = 0
    print()
    print("Aktarım başlıyor...")
    for Model in TABLOLAR:
        kayitlar = src.query(Model).all()
        if not kayitlar:
            print(f"  - {Model.__tablename__:25s} (boş)")
            continue
        # Doğrudan dict ile insert — ORM bypass
        for k in kayitlar:
            d = kayit_to_dict(k)
            dst.add(Model(**d))
        dst.commit()
        toplam += len(kayitlar)
        print(f"  ✓ {Model.__tablename__:25s} {len(kayitlar):>4d} kayıt")

    print()
    print(f"✅ Toplam {toplam} kayıt aktarıldı.")
    print()
    print("Sonraki adımlar:")
    print("  1) .env içinde DATABASE_URL'i şuna çevirin:")
    print(f"     DATABASE_URL=sqlite:///./perpak.db")
    print("  2) Backend'i yeniden başlatın")
    print("  3) Postgres servisini durdurabilirsiniz:")
    print("     brew services stop postgresql@16")

    src.close()
    dst.close()


if __name__ == "__main__":
    main()
