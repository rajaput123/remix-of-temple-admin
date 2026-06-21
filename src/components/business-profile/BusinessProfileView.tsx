import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { profileImageUrl } from "@/data/businessProfileMedia";
import { ProfileStatusBadge, VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { ProfileAvatar } from "@/components/business-profile/ProfileMedia";
import {
  businessTypeLabel,
  formatProfileLocation,
  formatUpdatedAt,
} from "@/components/business-profile/profileUtils";
import {
  computeProfileCompletion,
  getMissingRequiredFields,
  isVerificationComplete,
  isVerificationPending,
} from "@/components/business-profile/singleProfileUtils";
import { cn } from "@/lib/utils";
import { profileCardClass, profileTypography as t } from "@/components/business-profile/profileStyles";

interface BusinessProfileViewProps {
  profile: BusinessProfile;
  onEdit: () => void;
  onPublish: () => void;
}

function CoverHero({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  const url = profileImageUrl(failed ? null : src);

  return (
    <div className="relative h-[220px] sm:h-[280px] md:h-[320px]">
      {src && !failed ? (
        <img
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-700 to-amber-900/80" />
      )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-background" />
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={cn("p-4", profileCardClass)}>
      <p className={t.label}>{label}</p>
      <div className={cn("mt-2", accent)}>{value}</div>
      {sub && <p className={cn("mt-1", t.desc)}>{sub}</p>}
    </div>
  );
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
        {n}
      </span>
      <h2 className={t.section}>{title}</h2>
    </div>
  );
}

function DocChip({
  label,
  value,
  uploaded,
  onEdit,
}: {
  label: string;
  value: string;
  uploaded: boolean;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "flex min-w-[140px] flex-1 flex-col rounded-xl border p-3 text-left transition hover:shadow-md",
        uploaded
          ? "border-success/30 bg-success/5 hover:border-success/40"
          : "border-dashed border-border bg-muted/20 hover:border-muted-foreground/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={t.label}>{label}</span>
        {uploaded ? (
          <CheckCircle className="h-3.5 w-3.5 text-success" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground">{value || "Add document"}</p>
      <p className={cn("mt-0.5", t.desc)}>{uploaded ? "Verified file" : "Tap to upload"}</p>
    </button>
  );
}

function MasonryGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  const [hero, ...rest] = images;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <GalleryTile src={hero} className="sm:row-span-2 min-h-[220px] sm:min-h-full" large />
      <div className="grid gap-3 sm:grid-cols-1">
        {rest.slice(0, 2).map((src, i) => (
          <GalleryTile key={`${src}-${i}`} src={src} className="min-h-[140px]" />
        ))}
      </div>
    </div>
  );
}

function GalleryTile({ src, className, large }: { src: string; className?: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = profileImageUrl(failed ? null : src);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-muted/30",
        className,
      )}
    >
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        onError={() => setFailed(true)}
      />
      {large && (
        <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          Featured
        </div>
      )}
    </div>
  );
}

function CompletionRing({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="relative grid h-[88px] w-[88px] place-items-center">
      <svg className="-rotate-90" width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e7e5e4" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className={cn(t.title, "tabular-nums")}>{value}%</p>
        <p className={t.label}>Complete</p>
      </div>
    </div>
  );
}

export function BusinessProfileView({ profile, onEdit, onPublish }: BusinessProfileViewProps) {
  const navigate = useNavigate();
  const workingDays = profile.workingDays ?? [];
  const languages = profile.languages ?? [];
  const gallery = profile.gallery ?? [];
  const completion = computeProfileCompletion(profile);
  const missing = getMissingRequiredFields(profile);
  const canPublish = missing.length === 0 && profile.status !== "published";
  const verified = isVerificationComplete(profile);
  const pending = isVerificationPending(profile);
  const hasDocs = !!(profile.aadhaarDoc || profile.panDoc);
  const typeLabel = businessTypeLabel(profile.businessType, BUSINESS_TYPES);

  return (
    <div className="pb-16">
      {/* Immersive cover */}
      <div className="relative">
        <CoverHero src={profile.coverImage} />

        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-6xl items-start justify-between gap-3 px-4 pt-4 sm:px-6">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 border-0 bg-white/90 shadow-lg backdrop-blur-md hover:bg-white"
            onClick={() => navigate("/temple-hub")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 border-0 bg-white/90 shadow-lg backdrop-blur-md hover:bg-white"
              onClick={onEdit}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            {profile.status !== "published" && (
              <Button
                size="sm"
                className="gap-1.5 shadow-lg"
                disabled={!canPublish}
                onClick={onPublish}
              >
                <Send className="h-3.5 w-3.5" />
                Publish
              </Button>
            )}
          </div>
        </div>

        {verified && (
          <div className="absolute bottom-16 right-4 z-10 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:right-6">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </div>
        )}
      </div>

      {/* Rising content sheet */}
      <div className="relative z-20 -mt-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("rounded-t-2xl border border-border bg-card px-5 pb-8 pt-6 sm:rounded-2xl sm:px-8 sm:pt-8 sm:pb-10", profileCardClass)}>
          {/* Identity row */}
          <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <ProfileAvatar
                src={profile.logo}
                alt={profile.businessName}
                size="lg"
                className="-mt-20 border-[5px] border-card shadow-md sm:-mt-24"
              />
              <div className="min-w-0 sm:pb-1">
                <p className={t.eyebrow}>Business Connect · Profile</p>
                <div className="mb-2 mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{typeLabel}</Badge>
                  {profile.category && (
                    <Badge variant="outline">{profile.category}</Badge>
                  )}
                  {profile.experience && (
                    <span className={t.desc}>{profile.experience}+ yrs</span>
                  )}
                </div>
                <h1 className={t.title}>{profile.businessName}</h1>
                <p className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-1", t.muted)}>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatProfileLocation(profile)}
                  </span>
                  <span className="hidden sm:inline text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {profile.ownerName}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <ProfileStatusBadge status={profile.status} />
              <VerificationStatusBadge status={profile.verificationStatus} />
            </div>
          </div>

          {/* Bento stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Completion"
              value={<CompletionRing value={completion} />}
              accent="flex justify-center"
            />
            <StatTile
              label="Profile status"
              value={<ProfileStatusBadge status={profile.status} />}
              sub={profile.status === "published" ? "Live on marketplace" : "Not visible yet"}
            />
            <StatTile
              label="Verification"
              value={<VerificationStatusBadge status={profile.verificationStatus} />}
              sub={verified ? "Trust badge active" : pending ? "Review in progress" : "Documents needed"}
            />
            <StatTile
              label="Last updated"
              value={<p className={cn(t.body, "font-medium")}>{formatUpdatedAt(profile.updatedAt)}</p>}
              sub="Profile activity"
            />
          </div>

          {/* Publish alert */}
          {profile.status !== "published" && missing.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warning/10">
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className={cn(t.section, "text-warning")}>Finish setup to go live</p>
                  <p className={cn("mt-0.5", t.desc)}>
                    {missing.length} required field{missing.length > 1 ? "s" : ""} remaining
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={onEdit}>
                Complete profile
              </Button>
            </div>
          )}

          {/* Main content — editorial two-track layout */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left track — story + gallery */}
            <div className="space-y-10">
              <section className="space-y-4">
                <SectionLabel n="01" title="About the business" />
                <p className={cn(t.body, "text-muted-foreground whitespace-pre-wrap")}>
                  {profile.about || "No description provided yet."}
                </p>
              </section>

              {gallery.length > 0 && (
                <section className="space-y-4">
                  <SectionLabel n="02" title="Photos & gallery" />
                  <MasonryGallery images={gallery} />
                </section>
              )}

              <section className="space-y-4">
                <SectionLabel n={gallery.length > 0 ? "03" : "02"} title="Trust & documents" />
                <div className="flex flex-wrap gap-3">
                  <DocChip
                    label="Aadhaar"
                    value={profile.aadhaar ? `•••• ${profile.aadhaar.slice(-4)}` : ""}
                    uploaded={!!profile.aadhaarDoc}
                    onEdit={onEdit}
                  />
                  <DocChip label="PAN" value={profile.pan} uploaded={!!profile.panDoc} onEdit={onEdit} />
                  <DocChip label="GST" value={profile.gst || "Optional"} uploaded={!!profile.gstDoc} onEdit={onEdit} />
                </div>

                {verified && (
                  <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Verified — badge shown on your public listing
                  </div>
                )}
                {pending && (
                  <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Documents under review (2–3 business days)
                  </div>
                )}
                {profile.verificationStatus === "reupload_requested" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm text-blue-900">
                      <RefreshCw className="h-4 w-4" /> Reupload clearer copies
                    </p>
                    <Button size="sm" onClick={onEdit}>
                      <Upload className="mr-1.5 h-3.5 w-3.5" /> Update
                    </Button>
                  </div>
                )}
                {profile.verificationStatus === "rejected" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm text-red-900">
                      <XCircle className="h-4 w-4" /> Verification rejected
                    </p>
                    <Button size="sm" variant="outline" onClick={onEdit}>
                      Resubmit
                    </Button>
                  </div>
                )}
                {!hasDocs && !verified && (
                  <Button className="gap-1.5" onClick={onEdit}>
                    <Upload className="h-4 w-4" /> Upload verification documents
                  </Button>
                )}
              </section>
            </div>

            {/* Right track — contact panel */}
            <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <div className={cn("overflow-hidden", profileCardClass)}>
                <div className="border-b border-border bg-muted/20 px-5 py-3">
                  <p className={t.label}>Reach out</p>
                  <p className={cn("mt-1", t.section)}>Contact details</p>
                </div>
                <div className="space-y-1 p-2">
                  {[
                    { icon: Phone, label: "Phone", value: profile.mobile, sub: profile.whatsapp ? `WhatsApp ${profile.whatsapp}` : undefined },
                    { icon: Mail, label: "Email", value: profile.email },
                    { icon: MapPin, label: "Address", value: profile.address, sub: [profile.city, profile.state, profile.pincode].filter(Boolean).join(", ") },
                    { icon: User, label: "Owner", value: profile.ownerName },
                  ].map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className="rounded-lg px-3 py-3 transition hover:bg-muted/30">
                      <div className="flex gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={t.label}>{label}</p>
                          <p className="mt-0.5 text-sm font-medium break-all text-foreground">{value}</p>
                          {sub && <p className={cn("mt-0.5", t.desc)}>{sub}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cn("p-5", profileCardClass)}>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className={t.section}>Working hours</p>
                </div>
                <p className={cn("mt-3", t.mono, "text-sm font-medium")}>
                  {profile.openingTime}
                  <span className="mx-2 font-normal text-muted-foreground">–</span>
                  {profile.closingTime}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {workingDays.map((d) => (
                    <span
                      key={d}
                      className="rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                {languages.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className={cn("flex items-center gap-1.5", t.label)}>
                      <Globe className="h-3.5 w-3.5" /> Languages
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {languages.map((l) => (
                        <Badge key={l} variant="secondary" className="rounded-full text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center">
                <Sparkles className="mx-auto h-5 w-5 text-primary" />
                <p className={cn("mt-2", t.section)}>Marketplace preview</p>
                <p className={cn("mt-1", t.desc)}>
                  {profile.status === "published"
                    ? "Your profile is visible to devotees searching for services."
                    : "Publish to appear in Digidevalaya search results."}
                </p>
                {profile.status !== "published" && (
                  <Button size="sm" className="mt-3 w-full" disabled={!canPublish} onClick={onPublish}>
                    <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Go live
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
