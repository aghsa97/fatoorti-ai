import { type Country, type Currency, VAT_RATES } from "@/types";

export function getVatRate(country: Country): number {
  return VAT_RATES[country];
}

export function calculateVat(subtotal: number, vatRate: number) {
  const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { vatAmount, total };
}

export function formatCurrency(amount: number, currency: Currency): string {
  void currency;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencyByCountry(country: Country): Currency {
  const map: Record<Country, Currency> = {
    SA: "SAR",
    AE: "AED",
    EG: "EGP",
  };
  return map[country];
}
