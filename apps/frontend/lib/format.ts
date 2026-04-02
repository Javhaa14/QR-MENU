export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const elapsedMs = Date.now() - date.getTime();
  const seconds = Math.max(1, Math.floor(elapsedMs / 1000));

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} d ago`;
}
