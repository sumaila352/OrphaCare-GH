/** Convert Prisma Decimal/BigInt values for JSON responses */
export function toJson<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (v !== null && typeof v === 'object' && typeof (v as { toNumber?: () => number }).toNumber === 'function') {
        return (v as { toNumber: () => number }).toNumber();
      }
      if (typeof v === 'bigint') return Number(v);
      return v;
    }),
  ) as T;
}
