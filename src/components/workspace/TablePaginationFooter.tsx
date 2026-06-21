import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getVisiblePages } from "./tablePagination";

interface TablePaginationFooterProps {
  rangeStart: number;
  rangeEnd: number;
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePaginationFooter({
  rangeStart,
  rangeEnd,
  total,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  className,
}: TablePaginationFooterProps) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <footer
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <span>
        Showing {rangeStart}–{rangeEnd} of {total}
        {total > 0 && (
          <span className="text-muted-foreground/80">
            {" "}
            · {pageSize} per page
          </span>
        )}
      </span>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          {pages.map((page, i) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "secondary" : "ghost"}
                size="sm"
                className="h-7 min-w-7 px-2 text-xs"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
