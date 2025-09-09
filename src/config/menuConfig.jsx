export const getMenuItems = (t) => [
  {
    type: "link",
    label: t("dashboard"),
    icon: "fa fa-dashboard",
    permission: ["dashboard"],
    route: "/dashboard",
  },
  {
    type: "submenu",
    label: t("users_portal"),
    icon: "fa fa-paperclip",
    permission: ["users", "roles", "permissions", "assign-roles", "assign-permissions"],
    children: [
      { type: "link", label: t("users"), icon: "fa fa-user", route: "/users", permission: ["users"] },
      { type: "link", label: t("roles"), icon: "fa fa-shield", route: "/roles", permission: ["roles"] },
      { type: "link", label: t("permissions"), icon: "fa fa-key", route: "/permissions", permission: ["permissions"] },
      { type: "link", label: t("assign_roles"), icon: "fa fa-user-shield", route: "/assign-roles", permission: ["assign-roles"] },
      { type: "link", label: t("assign_permissions"), icon: "fa fa-lock", route: "/assign-permissions", permission: ["assign-permissions"] },
    ],
  },
  {
    type: "link",
    label: t("activity_logs"),
    icon: "fa fa-database",
    permission: ["activity-logs"],
    route: "/activity-logs",
  },
  {
    type: "link",
    label: t("database_tables"),
    icon: "fa fa-database",
    permission: ["database-tables"],
    route: "/database-tables",
  },
];
