import { ReactNode, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Inbox } from "lucide-react";
import { TablePaginationFooter } from "./TablePaginationFooter";
import { paginate, WORKSPACE_PAGE_SIZE } from "./tablePagination";

export interface WorkspaceColumnDef<T> {
  id: string;
  header: ReactNode | ((props: { allPageSelected: boolean; toggleAll: () => void }) => ReactNode);
  cell: (item: T, isSelected: boolean) => ReactNode;
  colStyle?: React.CSSProperties;
  className?: string;
  headerClassName?: string;
}

interface WorkspaceTableProps<T> {
  data: T[];
  columns: WorkspaceColumnDef<T>[];
  rowIdKey?: keyof T | ((item: T) => string);

  // Selection
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;

  // Pagination
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;

  // Row Interaction
  onRowClick?: (item: T, e: React.MouseEvent) => void;

  // Empty State
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;

  // Layout styling
  minWidth?: string;
  ariaLabel?: string;
  className?: string;
}

export function WorkspaceTable<T>({
  data,
  columns,
  rowIdKey,
  selectedIds,
  onSelectionChange,
  page,
  onPageChange,
  pageSize = WORKSPACE_PAGE_SIZE,
  onRowClick,
  emptyTitle = "No results match your filters",
  emptyDescription = "Try adjusting search query or filters.",
  emptyAction,
  minWidth = "min-w-[800px]",
  ariaLabel = "Data table",
  className,
}: WorkspaceTableProps<T>) {
  const getRowId = (item: T): string => {
    if (typeof rowIdKey === "function") return rowIdKey(item);
    if (rowIdKey) return String(item[rowIdKey]);
    return String((item as any).id);
  };

  const paginatedResult = useMemo(() => {
    return paginate(data, page, pageSize);
  }, [data, page, pageSize]);

  const { items: pagedItems, total, totalPages, currentPage, rangeStart, rangeEnd } = paginatedResult;

  // Sync page index if it goes out of bounds:
  useEffect(() => {
    if (page > totalPages) {
      onPageChange(totalPages);
    }
  }, [page, totalPages, onPageChange]);

  const pagedIds = pagedItems.map(getRowId);
  const showCheckboxes = !!selectedIds && !!onSelectionChange;
  const allPageSelected = showCheckboxes && pagedIds.length > 0 && pagedIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (!showCheckboxes) return;
    const next = new Set(selectedIds);
    if (allPageSelected) {
      pagedIds.forEach((id) => next.delete(id));
    } else {
      pagedIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    if (!showCheckboxes) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const isInteraction = (target: HTMLElement | null) => {
    if (!target || typeof target.closest !== "function") return false;
    return (
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.closest("button") !== null ||
      target.closest("a") !== null ||
      target.closest("[data-checkbox-cell]") !== null
    );
  };

  const totalColsCount = columns.length + (showCheckboxes ? 1 : 0);

  return (
    <div
      className={cn("flex flex-col overflow-x-auto pl-5", className)}
      role="region"
      aria-label={ariaLabel}
    >
      <Table variant="workspace" container={false} className={cn("table-workspace", minWidth)}>
        <colgroup>
          {showCheckboxes && <col style={{ width: "2.5rem" }} />}
          {columns.map((col) => (
            <col key={col.id} style={col.colStyle} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {showCheckboxes && (
              <TableHead className="text-center" data-checkbox-cell>
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.id} className={col.headerClassName}>
                {typeof col.header === "function"
                  ? col.header({ allPageSelected, toggleAll })
                  : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedItems.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={totalColsCount} className="p-0">
                <div className="py-16 text-center">
                  <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-foreground">{emptyTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>
                  {emptyAction && <div className="mt-4">{emptyAction}</div>}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pagedItems.map((item) => {
              const id = getRowId(item);
              const isSelected = !!selectedIds?.has(id);
              return (
                <TableRow
                  key={id}
                  data-state={isSelected ? "selected" : undefined}
                  tabIndex={0}
                  className="group cursor-pointer"
                  onClick={(e) => {
                    if (isInteraction(e.target as HTMLElement)) return;
                    onRowClick?.(item, e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isInteraction(e.target as HTMLElement)) {
                      e.preventDefault();
                      onRowClick?.(item, e as any);
                    }
                  }}
                >
                  {showCheckboxes && (
                    <TableCell
                      data-checkbox-cell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {col.cell(item, isSelected)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePaginationFooter
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
