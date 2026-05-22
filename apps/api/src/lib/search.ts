/** Name search compatible with SQLite (local) and PostgreSQL (production) */
export function nameSearch(field: string, query: string): Record<string, unknown> {
  const isSqlite = (process.env.DATABASE_URL ?? '').startsWith('file:');
  if (isSqlite) {
    // SQLite: case-insensitive via in-memory filter applied by caller, or simple contains
    return { [field]: { contains: query } };
  }
  return { [field]: { contains: query, mode: 'insensitive' } };
}

/** Filter rows by name when SQLite contains is not enough for case-insensitivity */
export function filterByName<T extends { fullName: string }>(rows: T[], query: string): T[] {
  if (!query) return rows;
  const isSqlite = (process.env.DATABASE_URL ?? '').startsWith('file:');
  if (!isSqlite) return rows;
  const lower = query.toLowerCase();
  return rows.filter((r) => r.fullName.toLowerCase().includes(lower));
}
