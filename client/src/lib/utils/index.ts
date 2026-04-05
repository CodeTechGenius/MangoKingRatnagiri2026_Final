export const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
export const formatDate = (d: Date | string, opts?: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
export const slugify = (t: string) => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
export const discountPct = (mrp: number, price: number) => mrp <= price ? 0 : Math.round(((mrp - price) / mrp) * 100);
export const isValidPhone = (p: string) => /^[6-9]\d{9}$/.test(p);
export const debounce = <T extends (...a: any[]) => any>(fn: T, ms: number) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};
