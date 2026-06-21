import { Award, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BusinessProfile } from "@/types/businessProfile";
import { ProfileStatusBadge, VerificationStatusBadge } from "@/components/business-profile/ProfileBadges";
import { profileCardClass } from "@/components/business-profile/profileStyles";
import { computeProfileCompletion } from "@/components/business-profile/singleProfileUtils";
import { formatUpdatedAt } from "@/components/business-profile/profileUtils";

interface SingleProfileStatusWidgetsProps {
  profile: BusinessProfile;
}

export function SingleProfileStatusWidgets({ profile }: SingleProfileStatusWidgetsProps) {
  const completion = computeProfileCompletion(profile);

  const items = [
    { label: "Profile Status", icon: Award, tint: "bg-blue-500/10 text-blue-600", content: <ProfileStatusBadge status={profile.status} /> },
    { label: "Verification", icon: ShieldCheck, tint: "bg-emerald-500/10 text-emerald-600", content: <VerificationStatusBadge status={profile.verificationStatus} /> },
    { label: "Completion", icon: CheckCircle2, tint: "bg-violet-500/10 text-violet-600", content: <span className="text-2xl font-bold tabular-nums">{completion}%</span> },
    { label: "Last Updated", icon: Clock, tint: "bg-amber-500/10 text-amber-600", content: <span className="text-sm font-semibold">{formatUpdatedAt(profile.updatedAt)}</span> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, icon: Icon, tint, content }) => (
        <Card key={label} className={profileCardClass}>
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className="mt-0.5">{content}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
