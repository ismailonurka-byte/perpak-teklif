#!/usr/bin/env bash
# Render başlangıç scripti: DB şemasını kur, master verisi yükle, admin + demo kullanıcılarını oluştur, ardından uvicorn'u başlat.
#
# ÖNEMLİ: Migration dışındaki seed adımları "non-fatal"dır (|| echo).
# Böylece herhangi bir seed hatası uvicorn'un başlamasını ENGELLEMEZ — site asla
# bir seed yüzünden 404'e düşmez. (Önceki set -e davranışında tek bir seed hatası
# tüm boot'u çökertip servisi komple düşürüyordu.)
set -e

echo "═══════════════════════════════════════════════════"
echo "  PERPAK TEKLIF SİSTEMİ — DEMO DEPLOY"
echo "═══════════════════════════════════════════════════"

cd /app

echo "[1/6] Alembic migration... (kritik)"
alembic upgrade head || { echo "❌ Migration başarısız"; exit 1; }

# Seed'ler bundan sonra non-fatal — biri patlasa bile uvicorn yine de başlar
set +e

echo "[2/6] Master verisi (karton, gramaj, fiyatlar)..."
python scripts/seed_master_data.py || echo "⚠ master seed hata verdi (atlandı)"

echo "[3/6] Admin kullanıcı..."
python scripts/create_admin.py || echo "⚠ admin seed hata verdi (atlandı)"

echo "[4/6] Demo kullanıcı: mehmetdogan..."
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
" || echo "⚠ mehmetdogan seed hata verdi (atlandı)"

echo "[5/6] Demo müşterileri (ABC vs.)..."
python scripts/seed_demo_data.py || echo "⚠ demo müşteri seed hata verdi (atlandı)"

echo "[6/6] Örnek teklifler (Doc/ Excel referansları — birebir)..."
python scripts/seed_ornek_teklifler.py || echo "⚠ örnek teklif seed hata verdi (atlandı)"

echo "═══════════════════════════════════════════════════"
echo "  uvicorn başlatılıyor (port: ${PORT:-8000})"
echo "═══════════════════════════════════════════════════"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
