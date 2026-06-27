import type { Request, Response } from "express";
import { Organization } from "../models/Organization";
import { getDashboardOverview } from "../services/organization.service";
import { sendError, sendSuccess } from "../utils/response";

export async function currentOrganizationController(req: Request, res: Response) {
  if (!req.organizationId) return sendError(res, 400, "Organization context required");
  const organization = await Organization.findById(req.organizationId).lean();
  if (!organization) return sendError(res, 404, "Organization not found");
  return sendSuccess(res, "Organization loaded", {
    organization: {
      id: String(organization._id),
      name: organization.name,
      slug: organization.slug,
      businessType: organization.businessType,
      ownerName: organization.ownerName,
      email: organization.email,
      phone: organization.phone,
      status: organization.status,
      plan: organization.plan,
      timezone: organization.timezone,
      branding: organization.branding,
      defaultWorkspace: organization.defaultWorkspace,
    },
  });
}

export async function dashboardOverviewController(req: Request, res: Response, next: Function) {
  try {
    if (!req.auth) return sendError(res, 401, "Authentication required");
    const result = await getDashboardOverview(req.auth.id, req.organizationId || req.auth.organizationId);
    return sendSuccess(res, "Dashboard overview", result);
  } catch (error) {
    return next(error);
  }
}
