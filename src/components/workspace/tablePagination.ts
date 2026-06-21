/** Default rows per page for paginated workspace tables (no inner scroll). */
export const WORKSPACE_PAGE_SIZE = 6;

export function paginate<T>(items: T[], page: number, pageSize: number = WORKSPACE_PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * pageSize;

  return {
    items: items.slice(offset, offset + pageSize),
    total,
    totalPages,
    currentPage,
    rangeStart: total === 0 ? 0 : offset + 1,
    rangeEnd: Math.min(offset + pageSize, total),
  };
}

export function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}
