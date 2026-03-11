export const fmtCur = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
export const todayStr = () => new Date().toISOString().split("T")[0];
export const genId = (prefix: string, count: number) => {
  const ts = Date.now().toString().slice(-4);
  return `${prefix}-2026-${String(count + 1).padStart(3, "0")}-${ts}`;
};
