import { Eye, ImageIcon, IndianRupee, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BusinessService } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { formatPrice, statusStyles } from "./shared";

interface ServiceCardProps {
  service: BusinessService;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ServiceCard({ service, onView, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition hover:border-primary/40 hover:shadow-sm">
      <div className="relative aspect-[16/10] bg-muted/60">
        {service.image ? (
          <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
        <Badge
          variant="secondary"
          className={cn("absolute right-2 top-2 shrink-0", statusStyles[service.status])}
        >
          {service.status}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{service.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{service.category || "—"}</p>
        <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
          <IndianRupee className="size-3.5 text-muted-foreground" />
          {formatPrice(service)}
        </p>
      </div>

      <Separator />
      <div className="flex items-center justify-end gap-1 px-3 py-2">
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs" onClick={onView}>
          <Eye className="size-3.5" />
          View
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-xs" onClick={onEdit}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
