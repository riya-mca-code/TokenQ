"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = getDashboardOverview;
const Organization_1 = require("../models/Organization");
const User_1 = require("../models/User");
const http_1 = require("../utils/http");
function serializeOrganization(organization) {
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
async function getDashboardOverview(userId, organizationId) {
    if (!organizationId) {
        const user = await User_1.User.findById(userId).lean();
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
        Organization_1.Organization.findById(organizationId).lean(),
        User_1.User.countDocuments({ organizationId, role: { $in: ["ADMIN", "STAFF"] }, deletedAt: null }),
        User_1.User.countDocuments({ organizationId, status: "ACTIVE", deletedAt: null }),
    ]);
    if (!organization) {
        throw Object.assign(new Error("Organization not found"), { status: 404 });
    }
    const user = await User_1.User.findById(userId).lean();
    return {
        user: {
            id: String(user?._id),
            organizationId,
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "ADMIN",
            status: user?.status || "ACTIVE",
        },
        organization: serializeOrganization(organization),
        metrics: {
            staffCount,
            activeUsers,
            status: (0, http_1.normalizeText)(organization.status),
        },
    };
}
