"use client";

import { PortalLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function BillingButton() {
  const openBilling = async () => {
    try {
      const res = await fetch("/api/billing/portal", {
        method: "GET",
        credentials: "include", 
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to generate portal link:", res.status, errorData);
        alert(`Failed to generate portal link: ${res.status} - ${JSON.stringify(errorData)}`);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL in response:", data);
        alert("No portal URL received from server");
      }
    } catch (error) {
      console.error("Error fetching portal link:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div>
      <button onClick={openBilling}>Manage billing</button>
      <PortalLink>Manage Account</PortalLink>
    </div>
  );
}
