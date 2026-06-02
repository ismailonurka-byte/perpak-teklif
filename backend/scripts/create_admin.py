"""İlk admin kullanıcısını oluşturur: admin / admin123"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password
from app.db.models import Kullanici
from app.db.session import SessionLocal


def main():
    db = SessionLocal()
    try:
        existing = db.query(Kullanici).filter(Kullanici.kullanici_adi == "admin").first()
        if existing:
            print("ℹ admin kullanıcısı zaten var, atlanıyor.")
            return

        admin = Kullanici(
            kullanici_adi="admin",
            sifre_hash=hash_password("admin123"),
            ad_soyad="Sistem Yöneticisi",
            rol="ADMIN",
            aktif=True,
        )
        db.add(admin)
        db.commit()
        print("✅ admin / admin123 oluşturuldu. İlk giriştan sonra şifreyi değiştirin.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
