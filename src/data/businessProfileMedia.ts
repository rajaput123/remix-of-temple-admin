/** Local demo media paths for the seeded business profile. */
export const DEMO_PROFILE_MEDIA = {
  logo: "/business-profile/logo.svg",
  cover: "/business-profile/logo.svg",
  gallery: [] as string[],
  fallback: "/placeholder.svg",
} as const;

export function profileImageUrl(url: string | null | undefined, fallback: string = DEMO_PROFILE_MEDIA.fallback): string {
  return url?.trim() ? url : fallback;
}

export function profileHasPlaceholderMedia(profile: {
  logo?: string | null;
  coverImage?: string | null;
  gallery?: string[];
}): boolean {
  const isPlaceholder = (u?: string | null) => !u || u.includes("placeholder.svg");
  return (
    isPlaceholder(profile.coverImage) &&
    (profile.gallery?.length === 0 || profile.gallery?.every(isPlaceholder))
  );
}
