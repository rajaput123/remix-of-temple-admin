import BusinessProfileShell from "@/components/business-profile/BusinessProfileShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import BusinessProfile from "@/pages/business/profile/BusinessProfile";

export default function BusinessProfileLayout() {
  return (
    <BusinessProfileShell>
      <ErrorBoundary>
        <BusinessProfile />
      </ErrorBoundary>
    </BusinessProfileShell>
  );
}
