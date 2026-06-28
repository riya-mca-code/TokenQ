import { Organization } from "../models/Organization";
import { User } from "../models/User";
import { normalizeText } from "../utils/http";

function serializeOrganization(organization: any) {
  return {
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
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
}

export async function getDashboardOverview(userId: string, organizationId: string | null) {
  if (!organizationId) {
    const user = await User.findById(userId).lean();
    return {
      user: {
        id: String(user?._id),
        organizationId: null,
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "SUPER_ADMIN",
        status: user?.status || "ACTIVE",
      },
      organization: null,
      metrics: {
        staffCount: 0,
        activeUsers: 0,
        status: "Platform access",
      },
    };
  }

  const [organization, staffCount, activeUsers] = await Promise.all([
    Organization.findById(organizationId).lean(),
    User.countDocuments({ organizationId, role: { $in: ["OWNER", "ADMIN", "STAFF"] }, deletedAt: null }),
    User.countDocuments({ organizationId, status: "ACTIVE", deletedAt: null }),
  ]);

  if (!organization) {
    throw Object.assign(new Error("Organization not found"), { status: 404 });
  }

  const user = await User.findById(userId).lean();
  return {
    user: {
      id: String(user?._id),
      organizationId,
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "OWNER",
      status: user?.status || "ACTIVE",
    },
    organization: serializeOrganization(organization),
    metrics: {
      staffCount,
      activeUsers,
      status: normalizeText(organization.status),
    },
  };
}
