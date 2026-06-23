import { ListChecks, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServicesEmptyStateProps {
  onAdd: () => void;
}

export function ServicesEmptyState({ onAdd }: ServicesEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="grid place-items-center px-6 py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ListChecks className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-foreground">No Services Added</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Create your first service and start receiving enquiries and bookings.
        </p>
        <Button onClick={onAdd} className="mt-5 gap-1.5">
          <Plus className="h-4 w-4" /> Create Service
        </Button>
      </CardContent>
    </Card>
  );
}
