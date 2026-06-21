import { Clock, Eye, ImageIcon, IndianRupee, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BusinessService } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { availabilityStyles, formatPrice, statusStyles } from "./shared";

interface ServiceCardProps {
  service: BusinessService;
  onView: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
}

export function ServiceCard({
  service,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: ServiceCardProps) {
  return (
    <Card className="group overflow-hidden transition hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted/60 text-muted-foreground">
          {service.image ? (
            <img src={service.image} alt={service.name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">{service.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {service.category}
                {service.subcategory ? ` · ${service.subcategory}` : ""}
              </p>
            </div>
            <Badge variant="secondary" className={cn("shrink-0", statusStyles[service.status])}>
              {service.status}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <IndianRupee className="h-3.5 w-3.5" />
              {formatPrice(service)}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                availabilityStyles[service.availability],
              )}
            >
              {service.availability}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.updatedAt}
            </span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{service.views} views</span>
          <span>·</span>
          <span>{service.enquiries} enquiries</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {service.status === "Active" ? (
                <DropdownMenuItem onClick={onDeactivate}>
                  <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onActivate}>
                  <Power className="mr-2 h-4 w-4" /> Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
