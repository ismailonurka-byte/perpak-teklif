"""Hesaplama motorları — Excel formüllerinden birebir çevrildi.

Tipik kullanım:
    from app.services.pricing import calculate
    sonuc = calculate("KUTU_OFSET", spec_dict, db)
    # sonuc.birim_satis, sonuc.toplam_satis, sonuc.detay (dict)
"""
from .registry import calculate, PRICING_FUNCTIONS, PricingResult

__all__ = ["calculate", "PRICING_FUNCTIONS", "PricingResult"]
