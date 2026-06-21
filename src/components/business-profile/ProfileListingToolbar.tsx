import { Building2, Download, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewModeToggle, type ViewMode } from "@/components/business-profile/ViewModeToggle";

interface ProfileListingToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  verificationFilter: string;
  onVerificationFilterChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreate: () => void;
  onExport: () => void;
  showFilters?: boolean;
}

export function ProfileListingToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  verificationFilter,
  onVerificationFilterChange,
  viewMode,
  onViewModeChange,
  onCreate,
  onExport,
  showFilters = true,
}: ProfileListingToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search profiles…"
            className="pl-9"
          />
        </div>
        {showFilters && (
          <>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={onVerificationFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="not_submitted">Not Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reupload_requested">Reupload</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" onClick={onCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Profile
        </Button>
      </div>
    </div>
  );
}

export function ProfileListingHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function ProfileLogoPlaceholder() {
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <Building2 className="h-6 w-6" />
    </div>
  );
}
