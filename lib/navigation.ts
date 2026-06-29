export const publicNavItems = [
  { href: "/#features", label: "Features" },
  { href: "/#security", label: "Security" },
  { href: "/login", label: "Login" },
];

export type DashboardRole = "SUPER_ADMIN" | "OWNER" | "ADMIN" | "STAFF";

export type DashboardNavItem = {
  href: string;
  label: string;
  roles: DashboardRole[];
};

const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    roles: ["SUPER_ADMIN", "OWNER", "ADMIN", "STAFF"],
  },
  {
    href: "/dashboard/queues",
    label: "Queues",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    roles: ["OWNER", "ADMIN"],
  },
];

export function getDashboardNavItems(role: DashboardRole) {
  return dashboardNavItems.filter((item) => item.roles.includes(role));
}
