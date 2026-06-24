import { Navigate, useLocation } from "react-router-dom";

/** Maps legacy temple communication URLs to the business communication module. */
export function CommunicationLegacyRedirect() {
  const { pathname } = useLocation();

  if (pathname.endsWith("/logs")) {
    return <Navigate to="/business-connect/communication/logs" replace />;
  }
  if (pathname.includes("/announcements")) {
    return <Navigate to="/business-connect/communication/announcements" replace />;
  }

  return <Navigate to="/business-connect/communication" replace />;
}
