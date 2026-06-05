"""PDF'i AYRI bir süreçte üretir — bellek izolasyonu (Render free 512 MB için).

Kullanım:
    python -m app.services.pdf.render_cli <teklif_id>

PDF byte'larını stdout'a yazar. Hata olursa traceback'i stderr'e yazıp
sıfırdan farklı bir kodla çıkar. Bu süreç bittiğinde WeasyPrint'in tükettiği
tüm bellek (font cache dahil) OS'a geri döner; ana uvicorn süreci hiç şişmez.
"""
import sys
import traceback
from uuid import UUID

from sqlalchemy.orm import joinedload


def main() -> int:
    if len(sys.argv) != 2:
        print("kullanım: python -m app.services.pdf.render_cli <teklif_id>", file=sys.stderr)
        return 2

    teklif_id = UUID(sys.argv[1])

    # Ağır importlar burada — yalnızca alt-süreçte yüklenir, ana süreçte değil.
    from app.db.models import Teklif
    from app.db.session import SessionLocal
    from app.services.pdf.proforma import render_proforma_pdf

    db = SessionLocal()
    try:
        t = (
            db.query(Teklif)
            .options(
                joinedload(Teklif.firma),
                joinedload(Teklif.olusturan),
                joinedload(Teklif.kalemler),
            )
            .filter(Teklif.id == teklif_id)
            .first()
        )
        if not t:
            print(f"Teklif bulunamadı: {teklif_id}", file=sys.stderr)
            return 3

        # Session açıkken render et ki şablondaki lazy ilişki erişimleri de çözülsün.
        pdf = render_proforma_pdf(t)
        sys.stdout.buffer.write(pdf)
        sys.stdout.buffer.flush()
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        traceback.print_exc()
        sys.exit(1)
