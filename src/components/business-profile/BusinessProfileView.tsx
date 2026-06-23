import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  CheckCircle2,
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
import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@/types/businessProfile";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { profileImageUrl } from "@/data/businessProfileMedia";
import { ProfileAvatar } from "@/components/business-profile/ProfileMedia";
import {
  businessTypeLabel,
  formatOptionalText,
  formatProfileLocation,
  formatUpdatedAt,
  profileAboutTitle,
  profileDisplayName,
  profileEntityLabel,
  profileStatusLabel,
  profileSubtitle,
  shouldShowGst,
  verificationStatusLabel,
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
  lockNavigation?: boolean;
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
        <div className="absolute bottom-3 left-3 text-[10px] font-medium text-white/90">Featured</div>
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

export function BusinessProfileView({ profile, onEdit, onPublish, lockNavigation }: BusinessProfileViewProps) {
  const navigate = useNavigate();
  const languages = profile.languages ?? [];
  const gallery = profile.gallery ?? [];
  const completion = computeProfileCompletion(profile);
  const missing = getMissingRequiredFields(profile);
  const canPublish = missing.length === 0 && profile.status !== "published";
  const verified = isVerificationComplete(profile);
  const pending = isVerificationPending(profile);
  const hasDocs = !!(profile.aadhaarDoc || profile.panDoc);
  const typeLabel = businessTypeLabel(profile.businessType, BUSINESS_TYPES);
  const displayName = profileDisplayName(profile);
  const entityLabel = profileEntityLabel(profile.entityType);
  const subtitle = profileSubtitle(profile);
  const isIndividual = profile.entityType === "individual";
  const isCompany = profile.entityType === "company";

  const socialLinks = [
    { label: "Instagram", value: profile.instagram },
    { label: "YouTube", value: profile.youtube },
    { label: "Facebook", value: profile.facebook },
  ].filter((link) => link.value?.trim());

  const contactRows = [
    { icon: Phone, label: "Mobile", value: formatOptionalText(profile.mobile, "—") },
    { icon: Phone, label: "WhatsApp", value: formatOptionalText(profile.whatsapp, "—") },
    {
      icon: Mail,
      label: "Email",
      value: profile.email.trim() ? profile.email : "Not provided",
    },
    {
      icon: MapPin,
      label: "Business address",
      value: formatOptionalText(profile.address, "—"),
      sub: [formatProfileLocation(profile), profile.mapLink?.trim() ? "View on map" : ""]
        .filter((part) => part && part !== "—")
        .join(" · ") || undefined,
    },
    ...(isIndividual && profile.businessName.trim()
      ? [{ icon: User, label: "Trade name", value: profile.businessName }]
      : []),
    ...(isCompany && profile.ownerName.trim()
      ? [
          {
            icon: User,
            label: "Authorized contact",
            value: profile.ownerName,
            sub: profile.contactDesignation.trim() || undefined,
          },
        ]
      : []),
    ...(profile.alternatePhone.trim()
      ? [{ icon: Phone, label: "Alternate mobile", value: profile.alternatePhone }]
      : []),
    ...(profile.landline.trim()
      ? [{ icon: Phone, label: "Landline", value: profile.landline }]
      : []),
  ];

  return (
    <div className="pb-16">
      {/* Immersive cover */}
      <div className="relative">
        <CoverHero src={profile.coverImage} />

        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-6xl items-start justify-between gap-3 px-4 pt-4 sm:px-6">
          {!lockNavigation && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 border-0 bg-white/90 shadow-lg backdrop-blur-md hover:bg-white"
              onClick={() => navigate("/business-connect/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {lockNavigation && <div />}
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
      </div>

      {/* Rising content sheet */}
      <div className="relative z-20 -mt-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("rounded-t-2xl border border-border bg-card px-5 pb-8 pt-6 sm:rounded-2xl sm:px-8 sm:pt-8 sm:pb-10", profileCardClass)}>
          {/* Identity row */}
          <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <ProfileAvatar
                src={profile.logo}
                alt={displayName}
                fallbackName={profile.ownerName || displayName}
                size="lg"
                className="-mt-20 border-[5px] border-card shadow-md sm:-mt-24"
              />
              <div className="min-w-0 sm:pb-1">
                <p className={t.eyebrow}>Business Connect · {entityLabel}</p>
                <div className="mb-2 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>{typeLabel}</span>
                  {profile.category && (
                    <>
                      <span className="text-border">·</span>
                      <span>{profile.category}</span>
                    </>
                  )}
                  {profile.experience && (
                    <>
                      <span className="text-border">·</span>
                      <span>{profile.experience}+ yrs</span>
                    </>
                  )}
                </div>
                <h1 className={t.title}>{displayName}</h1>
                {subtitle && <p className={cn("mt-0.5", t.muted)}>{subtitle}</p>}
                <p className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-1", t.muted)}>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatProfileLocation(profile)}
                  </span>
                  {isCompany && profile.contactDesignation.trim() && (
                    <>
                      <span className="hidden sm:inline text-border">·</span>
                      <span>{profile.contactDesignation}</span>
                    </>
                  )}
                </p>
              </div>
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
              value={<p className={cn(t.body, "font-medium")}>{profileStatusLabel(profile.status)}</p>}
              sub={profile.status === "published" ? "Live on marketplace" : "Not visible yet"}
            />
            <StatTile
              label="Verification"
              value={<p className={cn(t.body, "font-medium")}>{verificationStatusLabel(profile.verificationStatus)}</p>}
              sub={verified ? "Documents approved" : pending ? "Review in progress" : "Documents needed"}
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
                <SectionLabel n="01" title={profileAboutTitle(profile.entityType)} />
                <p className={cn(t.body, "text-muted-foreground whitespace-pre-wrap")}>
                  {profile.about || "No description provided yet."}
                </p>
              </section>

              {isCompany && (profile.legalCompanyName.trim() || profile.companyRegNumber.trim()) && (
                <section className="space-y-4">
                  <SectionLabel n="02" title="Registration details" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.legalCompanyName.trim() && (
                      <div className={cn("p-4", profileCardClass)}>
                        <p className={t.label}>Legal name</p>
                        <p className={cn("mt-1", t.body, "font-medium")}>{profile.legalCompanyName}</p>
                      </div>
                    )}
                    {profile.companyRegNumber.trim() && (
                      <div className={cn("p-4", profileCardClass)}>
                        <p className={t.label}>Registration number</p>
                        <p className={cn("mt-1", t.body, "font-medium font-mono text-sm")}>
                          {profile.companyRegNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {gallery.length > 0 && (
                <section className="space-y-4">
                  <SectionLabel
                    n={isCompany && (profile.legalCompanyName.trim() || profile.companyRegNumber.trim()) ? "03" : "02"}
                    title="Photos & gallery"
                  />
                  <MasonryGallery images={gallery} />
                </section>
              )}

              <section className="space-y-4">
                <SectionLabel
                  n={
                    gallery.length > 0
                      ? isCompany && (profile.legalCompanyName.trim() || profile.companyRegNumber.trim())
                        ? "04"
                        : "03"
                      : isCompany && (profile.legalCompanyName.trim() || profile.companyRegNumber.trim())
                        ? "03"
                        : "02"
                  }
                  title="Trust & documents"
                />
                <div className="flex flex-wrap gap-3">
                  <DocChip
                    label="Aadhaar"
                    value={profile.aadhaar ? `•••• ${profile.aadhaar.slice(-4)}` : ""}
                    uploaded={!!profile.aadhaarDoc}
                    onEdit={onEdit}
                  />
                  <DocChip label="PAN" value={profile.pan} uploaded={!!profile.panDoc} onEdit={onEdit} />
                  {shouldShowGst(profile) && (
                    <DocChip
                      label="GST"
                      value={
                        profile.gst.trim() ||
                        (isIndividual ? "Not registered" : formatOptionalText(profile.gst, "Not provided"))
                      }
                      uploaded={!!profile.gstDoc}
                      onEdit={onEdit}
                    />
                  )}
                  {isCompany && (
                    <DocChip
                      label="Incorporation"
                      value={profile.incorporationDoc ? "Uploaded" : "Add certificate"}
                      uploaded={!!profile.incorporationDoc}
                      onEdit={onEdit}
                    />
                  )}
                </div>

                {verified && (
                  <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Documents verified — profile approved
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
                  {contactRows.map(({ icon: Icon, label, value, sub }) => (
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

              {socialLinks.length > 0 && (
                <div className={cn("p-5", profileCardClass)}>
                  <div className="flex items-center gap-2 text-foreground">
                    <Globe className="h-4 w-4 text-primary" />
                    <p className={t.section}>Social</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {socialLinks.map(({ label, value }) => {
                      const href = value.startsWith("http") ? value : null;
                      return href ? (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm text-primary hover:underline"
                        >
                          {label}: {value}
                        </a>
                      ) : (
                        <span key={label} className="block truncate text-sm text-foreground">
                          {label}: {value}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={cn("p-5", profileCardClass)}>
                <div className="flex items-center gap-2 text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  <p className={t.section}>Languages</p>
                </div>
                {languages.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {languages.map((l) => (
                      <span
                        key={l}
                        className="rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={cn("mt-3", t.desc)}>No languages added.</p>
                )}
              </div>

              <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center">
                <Sparkles className="mx-auto h-5 w-5 text-primary" />
                <p className={cn("mt-2", t.section)}>Marketplace preview</p>
                <p className={cn("mt-1", t.desc)}>
                  {profile.status === "published"
                    ? "Your profile is visible to customers searching for services."
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
