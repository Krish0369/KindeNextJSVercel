import { Organizations } from "@kinde/management-api-js";
import { initManagementClient } from "./client";

export interface OrgStatus {
  name: string | null;
  isSuspended: boolean | null;
  suspendedOn: string | null;
}

const EMPTY_ORG_STATUS: OrgStatus = {
  name: null,
  isSuspended: null,
  suspendedOn: null,
};

/**
 * Fetches an organization's name and suspension status from the Management API.
 * Returns null fields if the API is unavailable so the UI can show "Unknown".
 */
export async function fetchOrgStatus(orgCode: string): Promise<OrgStatus> {
  if (!initManagementClient()) {
    return EMPTY_ORG_STATUS;
  }

  try {
    const org = await Organizations.getOrganization({ code: orgCode });

    return {
      name: org.name ?? null,
      isSuspended: org.is_suspended ?? null,
      suspendedOn: org.suspended_on ?? null,
    };
  } catch (error) {
    console.error("[kinde-management] getOrganization failed", error);
    return EMPTY_ORG_STATUS;
  }
}
