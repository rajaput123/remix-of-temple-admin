import { Package, Plus, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PackagesEmptyStateProps {
  onAdd: () => void;
  onImport?: () => void;
}

export function PackagesEmptyState({ onAdd, onImport }: PackagesEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="grid place-items-center px-6 py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-foreground">No Package Tiers Yet</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Add extra tiers for your main services — e.g. Complete or Premium packages on top of a base service.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={onAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Package
          </Button>
          {onImport && (
            <Button variant="outline" onClick={onImport} className="gap-1.5">
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
