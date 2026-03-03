"use client";

import { useEffect, useState } from 'react';

interface BillingInfoProps {
  orgCode: string;
}

export default function BillingInfo({ orgCode }: BillingInfoProps) {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch(`/api/billing/entitlements?org_code=${orgCode}`);
        if (response.ok) {
          const data = await response.json();
          setBillingData(data);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [orgCode]);

  if (loading) return <p>Loading billing information...</p>;

  return (
    <div className="billing-details">
      <h3>Billing Information</h3>
      {billingData ? (
        <pre>{JSON.stringify(billingData, null, 2)}</pre>
      ) : (
        <p>No billing information available</p>
      )}
    </div>
  );
}