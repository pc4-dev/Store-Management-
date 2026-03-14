export const fmtCur = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
export const todayStr = () => new Date().toISOString().split("T")[0];
export const genId = (prefix: string, count: number) => {
  const ts = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-2026-${String(count + 1).padStart(3, "0")}-${ts}-${random}`;
};

export const generateSku = (category: string, subCategory: string, count: number) => {
  const cat = (category || "MIS").substring(0, 3).charAt(0).toUpperCase() + (category || "MIS").substring(1, 3).toLowerCase();
  const sub = (subCategory || "GEN").substring(0, 3).charAt(0).toUpperCase() + (subCategory || "GEN").substring(1, 3).toLowerCase();
  const num = String(count + 1).padStart(4, "0");
  return `${cat}/${sub}/${num}`;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") val = JSON.stringify(val);
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${todayStr()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
