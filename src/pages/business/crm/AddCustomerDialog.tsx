import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addBusinessCustomer } from "@/stores/businessCustomerStore";
import type { BusinessCustomer, CustomerSource, CustomerStatus, CustomerType } from "@/types/businessCustomer";

const TAG_OPTIONS = ["Premium", "Repeat", "New Lead", "Corporate", "High Value", "Wedding", "From Booking"];
const SOURCE_OPTIONS: CustomerSource[] = ["Counter", "Online", "Referral", "Marketplace", "WhatsApp"];

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("Individual");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [source, setSource] = useState<CustomerSource>("Counter");
  const [status, setStatus] = useState<CustomerStatus>("Active");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setCompanyName("");
    setCustomerType("Individual");
    setCity("");
    setState("");
    setPincode("");
    setAddress("");
    setPan("");
    setGstin("");
    setSource("Counter");
    setStatus("Active");
    setTags([]);
    setNotes("");
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      const payload: Omit<BusinessCustomer, "id" | "createdAt" | "totalBookings" | "lifetimeSpend"> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        companyName: customerType === "Corporate" ? companyName.trim() || undefined : undefined,
        customerType,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
        address: address.trim() || undefined,
        pan: pan.trim() || undefined,
        gstin: customerType === "Corporate" ? gstin.trim() || undefined : undefined,
        tags,
        source,
        status,
        notes: notes.trim() || undefined,
      };
      addBusinessCustomer(payload);
      toast.success("Customer added");
      onOpenChange(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add customer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Register a new customer for your business CRM</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Full name *</Label>
              <Input className="mt-1 h-9 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
            </div>
            <div>
              <Label className="text-xs">Phone *</Label>
              <Input className="mt-1 h-9 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input className="mt-1 h-9 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <Label className="text-xs">Customer type</Label>
              <Select value={customerType} onValueChange={(v) => setCustomerType(v as CustomerType)}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus)}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {customerType === "Corporate" && (
              <>
                <div className="col-span-2">
                  <Label className="text-xs">Company name</Label>
                  <Input className="mt-1 h-9 text-sm" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">GSTIN</Label>
                  <Input className="mt-1 h-9 text-sm" value={gstin} onChange={(e) => setGstin(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs">PAN</Label>
              <Input className="mt-1 h-9 text-sm" value={pan} onChange={(e) => setPan(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v as CustomerSource)}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Address</Label>
              <Input className="mt-1 h-9 text-sm" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Input className="mt-1 h-9 text-sm" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">State</Label>
              <Input className="mt-1 h-9 text-sm" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Pincode</Label>
              <Input className="mt-1 h-9 text-sm" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs">Tags</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {TAG_OPTIONS.map((tag) => (
                <label key={tag} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={tags.includes(tag)}
                    onCheckedChange={(checked) => {
                      setTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)));
                    }}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea className="mt-1 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Relationship notes, preferences…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
