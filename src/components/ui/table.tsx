import * as React from "react";

import { cn } from "@/lib/utils";

type TableVariant = "default" | "workspace";

const TableVariantContext = React.createContext<TableVariant>("default");

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  /** When false, table renders without overflow wrapper (workspace pages use TableRegion) */
  container?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = "default", container = true, ...props }, ref) => {
    const table = (
      <TableVariantContext.Provider value={variant}>
        <table
          ref={ref}
          className={cn(
            "w-full caption-bottom text-left",
            variant === "workspace" ? "w-full table-fixed border-collapse text-xs" : "text-sm",
            className,
          )}
          {...props}
        />
      </TableVariantContext.Provider>
    );

    if (variant === "workspace" && !container) return table;

    return <div className="relative w-full overflow-auto">{table}</div>;
  },
);
Table.displayName = "Table";

const useTableVariant = () => React.useContext(TableVariantContext);

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const variant = useTableVariant();
    return (
      <thead
        ref={ref}
        className={cn(
          variant === "workspace"
            ? "border-b border-border shadow-none [&_tr]:border-0"
            : "[&_tr]:border-b",
          className,
        )}
        {...props}
      />
    );
  },
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const variant = useTableVariant();
    return (
      <tbody
        ref={ref}
        className={cn(
          variant === "workspace" ? "divide-y divide-border [&_tr:last-child]:border-0" : "[&_tr:last-child]:border-0",
          className,
        )}
        {...props}
      />
    );
  },
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    const variant = useTableVariant();
    return (
      <tr
        ref={ref}
        className={cn(
          variant === "workspace"
            ? "border-0 transition-colors duration-[120ms] hover:bg-surface data-[state=selected]:bg-primary/5"
            : "border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50",
          className,
        )}
        {...props}
      />
    );
  },
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    const variant = useTableVariant();
    return (
      <th
        ref={ref}
        className={cn(
          "align-middle text-muted-foreground",
          variant === "workspace"
            ? "px-3 text-[10px] font-bold uppercase tracking-wider [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:px-4"
            : "h-12 px-4 text-left font-medium [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    );
  },
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    const variant = useTableVariant();
    return (
      <td
        ref={ref}
        className={cn(
          "align-middle",
          variant === "workspace"
            ? "px-3 text-xs [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:px-4 [&:has([role=checkbox])]:py-0"
            : "p-4 [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    );
  },
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
