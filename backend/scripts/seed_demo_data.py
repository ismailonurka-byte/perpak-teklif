"""Demo verisi — Render deploy'unda her container başlangıcında çalışır.
   start.sh tarafından çağrılır. Sadece kayıt yoksa ekler (idempotent).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.db.models import Firma


DEMO_FIRMALAR = [
    {
        "ad": "ABC Ambalaj San. Tic. Ltd. Şti.",
        "yetkili": "Ali Bey Cevizli",
        "telefon": "0532 123 45 67",
        "email": "ali@abcambalaj.com",
        "adres": "Cevizli Mah. ABC Cad. No: 12, Maltepe / İstanbul",
        "vergi_no": "1234567890",
        "vergi_dairesi": "Maltepe",
        "notlar": "Demo müşteri — Render deploy'unda otomatik oluşturulur.",
    },
]


def main():
    db = SessionLocal()
    eklenen = 0
    for veri in DEMO_FIRMALAR:
        varmi = db.query(Firma).filter(Firma.ad == veri["ad"]).first()
        if varmi:
            print(f"  ℹ {veri['ad']} zaten var")
            continue
        db.add(Firma(**veri))
        eklenen += 1
        print(f"  + {veri['ad']}")
    db.commit()
    db.close()
    print(f"✅ Demo veri seed bitti ({eklenen} yeni kayıt)")


if __name__ == "__main__":
    main()
