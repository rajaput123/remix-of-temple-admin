import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Clock,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { readRegistrationData } from "@/lib/registrationProfileBridge";

const PROFILE_LS_KEY = "qoo.user.profile";
const AVATAR_LS_KEY = "qoo.user.avatar";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

function buildInitialProfile(): UserProfile {
  // 1. Try persisted profile (from a previous save in this page)
  try {
    const saved = localStorage.getItem(PROFILE_LS_KEY);
    if (saved) return JSON.parse(saved) as UserProfile;
  } catch {
    /* ignore */
  }

  // 2. Fall back to registrationData
  const reg = readRegistrationData();
  const contactName = reg?.contactPerson || "";
  const parts = contactName.trim().split(" ");
  const firstName = parts[0] || "Admin";
  const lastName = parts.slice(1).join(" ") || "";

  return {
    firstName,
    lastName,
    email: reg?.email || "",
    phone: reg?.mobile ? `+91 ${reg.mobile}` : "",
    role: "super_admin",
    timezone: "Asia/Kolkata",
    emailVerified: Boolean(reg?.email),
    phoneVerified: Boolean(reg?.mobile),
  };
}

function loadAvatar(): string | null {
  try {
    return localStorage.getItem(AVATAR_LS_KEY) || null;
  } catch {
    return null;
  }
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator",
    editor: "Editor",
    viewer: "Viewer",
  };
  return labels[role] ?? role;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
}

const ProfileSettings = () => {
  const [formData, setFormData] = useState<UserProfile>(buildInitialProfile);
  const [avatar, setAvatar] = useState<string | null>(loadAvatar);
  const [saved, setSaved] = useState(buildInitialProfile);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(saved);

  const handleSave = () => {
    try {
      localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(formData));
    } catch {
      /* ignore */
    }
    setSaved(formData);
    toast.success("Profile updated successfully");
  };

  const handleReset = () => {
    setFormData(saved);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      try {
        localStorage.setItem(AVATAR_LS_KEY, dataUrl);
      } catch {
        /* ignore quota */
      }
      toast.success("Profile photo updated");
    };
    reader.readAsDataURL(file);
  };

  const field = (key: keyof UserProfile, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account details and preferences
        </p>
      </div>

      {/* Avatar + identity card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            {/* Avatar with upload overlay */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                {avatar && <AvatarImage src={avatar} alt="Profile photo" />}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {getInitials(formData.firstName, formData.lastName)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow cursor-pointer hover:bg-primary/90 transition-colors"
                title="Change photo"
              >
                <Camera className="h-3.5 w-3.5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            {/* Name + role summary */}
            <div className="min-w-0">
              <p className="text-lg font-semibold text-foreground truncate">
                {[formData.firstName, formData.lastName].filter(Boolean).join(" ") || "—"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.email || "No email set"}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {getRoleLabel(formData.role)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => field("firstName", e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => field("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => field("email", e.target.value)}
                  placeholder="you@temple.org"
                  className="flex-1"
                />
                {formData.emailVerified ? (
                  <Badge variant="default" className="gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <XCircle className="h-3 w-3" /> Unverified
                  </Badge>
                )}
              </div>
              {!formData.emailVerified && (
                <Button variant="outline" size="sm" className="mt-1">
                  Send verification
                </Button>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => field("phone", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="flex-1"
                />
                {formData.phoneVerified ? (
                  <Badge variant="default" className="gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <XCircle className="h-3 w-3" /> Unverified
                  </Badge>
                )}
              </div>
              {!formData.phoneVerified && (
                <Button variant="outline" size="sm" className="mt-1">
                  Verify via OTP
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => field("role", val)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(val) => field("timezone", val)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!isDirty}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
