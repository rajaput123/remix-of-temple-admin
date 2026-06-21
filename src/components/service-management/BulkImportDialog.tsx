import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BusinessService } from "@/types/serviceManagement";
import { emptyService, serviceManagementStore } from "@/stores/serviceManagementStore";
import {
  parseCsv,
  parsePackageImportRows,
  parseServiceImportRows,
  packageImportTemplateCsv,
  serviceImportTemplateCsv,
  type ParsedPackageRow,
  type ParsedServiceRow,
} from "./csvUtils";

type ImportKind = "services" | "packages";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ImportKind;
  services: BusinessService[];
  onImported?: () => void;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  kind,
  services,
  onImported,
}: BulkImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceRows, setServiceRows] = useState<ParsedServiceRow[]>([]);
  const [packageRows, setPackageRows] = useState<ParsedPackageRow[]>([]);

  const reset = () => {
    setInputText("");
    setStep(1);
    setServiceRows([]);
    setPackageRows([]);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleDownloadTemplate = () => {
    if (kind === "services") serviceImportTemplateCsv();
    else packageImportTemplateCsv(services);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setInputText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const handlePreview = () => {
    const rows = parseCsv(inputText);
    if (kind === "services") {
      setServiceRows(parseServiceImportRows(rows));
    } else {
      setPackageRows(parsePackageImportRows(rows, services));
    }
    setStep(2);
  };

  const parsed = kind === "services" ? serviceRows : packageRows;
  const validCount = parsed.filter((r) => r.errors.length === 0).length;
  const errorCount = parsed.length - validCount;

  const handleImport = () => {
    if (kind === "services") {
      serviceRows
        .filter((r) => r.errors.length === 0)
        .forEach((r) => {
          serviceManagementStore.upsertService({
            ...emptyService(),
            ...r.data,
            id: "",
            status: r.data.status ?? "Draft",
          });
        });
    } else {
      packageRows
        .filter((r) => r.errors.length === 0)
        .forEach((r) => {
          serviceManagementStore.upsertPackage({
            ...r.data,
            id: "",
            updatedAt: "",
          });
        });
    }
    onImported?.();
    handleClose(false);
  };

  const title = kind === "services" ? "Import Services" : "Import Packages";
  const description =
    kind === "services"
      ? "Upload or paste a CSV file to bulk-add services. Download the template for the correct column format."
      : "Upload or paste a CSV to add package tiers. Each row needs a mainService and tier details.";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 overflow-y-auto py-1">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadTemplate}>
                <Download className="size-3.5" /> Download template
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-3.5" /> Upload CSV
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            <Textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                kind === "services"
                  ? "name,category,subcategory,description,status,pricingType,price,currency,city,state,availability\n..."
                  : "mainService,name,description,price,discount,validity,status\n..."
              }
              className="font-mono text-xs"
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="mb-3 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="size-3.5" /> {validCount} valid
              </span>
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <AlertTriangle className="size-3.5" /> {errorCount} with errors
                </span>
              )}
            </div>
            <Table variant="workspace" container={false}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Row</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((row) => (
                  <TableRow key={row.index} className={cn(row.errors.length > 0 && "bg-destructive/5")}>
                    <TableCell className="font-mono text-xs">{row.index}</TableCell>
                    <TableCell className="text-xs">{row.data.name || "—"}</TableCell>
                    <TableCell className="text-xs">{row.data.status ?? "Draft"}</TableCell>
                    <TableCell className="text-xs">
                      {row.errors.length === 0 ? (
                        <span className="text-success">Ready</span>
                      ) : (
                        <span className="text-destructive">{row.errors.join("; ")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 2 && (
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button type="button" onClick={handlePreview} disabled={!inputText.trim()}>
              Preview
            </Button>
          ) : (
            <Button type="button" onClick={handleImport} disabled={validCount === 0}>
              Import {validCount} {kind === "services" ? "service" : "package"}
              {validCount === 1 ? "" : "s"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
