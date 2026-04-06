function normalizeCurrencyCode(currency?: string) {
  const normalized = (currency ?? "MNT").toUpperCase();

  if (normalized === "USD" || normalized === "TUG") {
    return "MNT";
  }

  return normalized;
}

export function formatCurrency(value: number, currency = "MNT") {
  const normalizedCurrency = normalizeCurrencyCode(currency);

  if (normalizedCurrency === "MNT") {
    return `${new Intl.NumberFormat("mn-MN", {
      maximumFractionDigits: 0,
    }).format(Math.round(value))}₮`;
  }

  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const elapsedMs = Date.now() - date.getTime();
  const seconds = Math.max(1, Math.floor(elapsedMs / 1000));

  if (seconds < 60) return `${seconds} сек өмнө`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин өмнө`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} цаг өмнө`;
  return `${Math.floor(seconds / 86400)} өдөр өмнө`;
}
