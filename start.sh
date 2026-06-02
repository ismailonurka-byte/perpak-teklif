#!/usr/bin/env bash
# Render başlangıç scripti: DB şemasını kur, master verisi yükle, admin + demo kullanıcılarını oluştur, ardından uvicorn'u başlat.
set -e

echo "═══════════════════════════════════════════════════"
echo "  PERPAK TEKLIF SİSTEMİ — DEMO DEPLOY"
echo "═══════════════════════════════════════════════════"

cd /app

echo "[1/4] Alembic migration..."
alembic upgrade head || { echo "❌ Migration başarısız"; exit 1; }

echo "[2/4] Master verisi (karton, gramaj, fiyatlar)..."
python scripts/seed_master_data.py

echo "[3/4] Admin kullanıcı..."
python scripts/create_admin.py

echo "[4/5] Demo kullanıcı: mehmetdogan..."
python -c "
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.db.models import Kullanici
db = SessionLocal()
if not db.query(Kullanici).filter(Kullanici.kullanici_adi == 'mehmetdogan').first():
    db.add(Kullanici(
        kullanici_adi='mehmetdogan',
        sifre_hash=hash_password('mehmetdogan'),
        ad_soyad='Mehmet Doğan',
        unvan='Satış Temsilcisi',
        rol='SATIS',
        email='mehmet.dogan@perpak.com.tr',
        aktif=True,
    ))
    db.commit()
    print('  ✓ mehmetdogan oluşturuldu')
else:
    print('  ℹ mehmetdogan zaten var')
db.close()
"

echo "[5/5] Demo müşterileri (ABC vs.)..."
python scripts/seed_demo_data.py

echo "═══════════════════════════════════════════════════"
echo "  uvicorn başlatılıyor (port: ${PORT:-8000})"
echo "═══════════════════════════════════════════════════"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
