"use client";

import { PortalLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useEffect, useState, type CSSProperties } from "react";

interface DashboardData {
  organization: {
    code: string | null;
    name: string | null;
    isSuspended: boolean | null;
    suspendedOn: string | null;
  };
  user: {
    id: string | null;
    email: string | null;
    givenName: string | null;
    familyName: string | null;
    fullName: string;
  };
  entitlements: unknown;
  permissions: unknown;
  roles: unknown;
}

interface TokenData {
  readable: string;
  raw: string | null;
}

type ViewerView =
  | "id-readable"
  | "id-raw"
  | "access-readable"
  | "access-raw"
  | "entitlements"
  | "permissions"
  | "roles"
  | null;

const detailPreStyle: CSSProperties = {
  marginTop: "0.75rem",
  overflowX: "auto",
  backgroundColor: "#f9f9f9",
  padding: "0.75rem",
  borderRadius: "0.5rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

function formatDetail(data: unknown): string {
  if (data === null || data === undefined) {
    return "null";
  }
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function hasDetail(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  if (typeof data === "object") {
    return Object.keys(data as Record<string, unknown>).length > 0;
  }
  return true;
}

function formatOrgStatus(org: DashboardData["organization"] | undefined): string {
  if (!org || org.isSuspended === null || org.isSuspended === undefined) {
    return "Unknown";
  }
  if (org.isSuspended) {
    return org.suspendedOn
      ? `Suspended (since ${new Date(org.suspendedOn).toLocaleString()})`
      : "Suspended";
  }
  return "Active";
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [idTokenData, setIdTokenData] = useState<TokenData | null>(null);
  const [accessTokenData, setAccessTokenData] = useState<TokenData | null>(null);
  const [selectedViewer, setSelectedViewer] = useState<ViewerView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetch("/api/protected", { credentials: "include" });

        if (!response.ok) {
          setErrorMessage("Unable to load dashboard details.");
          return;
        }

        const responseData = (await response.json()) as {
          data?: {
            dashboard?: DashboardData;
            idToken?: TokenData;
            accessToken?: TokenData;
          };
        };

        setDashboardData(responseData.data?.dashboard ?? null);
        setIdTokenData(responseData.data?.idToken ?? null);
        setAccessTokenData(responseData.data?.accessToken ?? null);
      } catch {
        setErrorMessage("Unable to load dashboard details.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const getViewerDisplay = (): string => {
    switch (selectedViewer) {
      case "id-readable":
        return idTokenData?.readable ?? "No ID token readable format available.";
      case "id-raw":
        return idTokenData?.raw ?? "No ID token raw format available.";
      case "access-readable":
        return accessTokenData?.readable ?? "No access token readable format available.";
      case "access-raw":
        return accessTokenData?.raw ?? "No access token raw format available.";
      case "entitlements":
        return hasDetail(dashboardData?.entitlements)
          ? formatDetail(dashboardData?.entitlements)
          : "No entitlements available.";
      case "permissions":
        return hasDetail(dashboardData?.permissions)
          ? formatDetail(dashboardData?.permissions)
          : "No permissions available.";
      case "roles":
        return hasDetail(dashboardData?.roles)
          ? formatDetail(dashboardData?.roles)
          : "No roles available.";
      default:
        return "";
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "2rem" }}>
      <div className="next-steps-section" style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <PortalLink className="btn btn-ghost">Manage Account</PortalLink>
        </div>

        {isLoading ? (
          <p className="text-body-3">Loading dashboard details...</p>
        ) : errorMessage ? (
          <p className="text-body-3">{errorMessage}</p>
        ) : (
          <>
            <section className="billing-details">
              <p className="text-heading-2">Organization Details</p>
              <p className="text-body-3">
                Organization Name: {dashboardData?.organization.name ?? "N/A"}
              </p>
              <p className="text-body-3">
                Organization Code: {dashboardData?.organization.code ?? "N/A"}
              </p>
              <p className="text-body-3">
                Status: {formatOrgStatus(dashboardData?.organization)}
              </p>
            </section>

            <section className="billing-details">
              <p className="text-heading-2">User Details</p>
              <p className="text-body-3">Name: {dashboardData?.user.fullName || "N/A"}</p>
              <p className="text-body-3">Email: {dashboardData?.user.email ?? "N/A"}</p>
              <p className="text-body-3">User ID: {dashboardData?.user.id ?? "N/A"}</p>
            </section>

            <section className="billing-details">
              <p className="text-heading-2">Token Viewer</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <button className="btn btn-ghost" onClick={() => setSelectedViewer("id-readable")}>
                  ID Token (Readable)
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedViewer("id-raw")}>
                  ID Token (Raw)
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setSelectedViewer("access-readable")}
                >
                  Access Token (Readable)
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedViewer("access-raw")}>
                  Access Token (Raw)
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedViewer("entitlements")}>
                  Entitlements
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedViewer("permissions")}>
                  Permissions
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedViewer("roles")}>
                  Roles
                </button>
              </div>

              {selectedViewer ? (
                <pre className="text-body-3" style={detailPreStyle}>
                  {getViewerDisplay()}
                </pre>
              ) : (
                <p className="text-body-3" style={{ marginTop: "0.75rem" }}>
                  Select a token or auth detail to view.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
