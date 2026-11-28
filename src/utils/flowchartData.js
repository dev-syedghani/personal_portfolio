/** Interactive system flowchart — nodes, edges, and per-tech telemetry specs.
 *
 * NOTE: cluster.x / cluster.y / cluster.w have been removed. The component now
 * places clusters with CSS Grid named areas (see SystemFlowchart.jsx), so each
 * cluster's `id` below must match a grid-area name exactly: infra, integrations,
 * frontend, data, payments. No manual coordinates needed — rows auto-size to
 * content, so this can't overlap regardless of how many items a cluster has.
 */

export const FLOW_CORE = {
  id: "core",
  label: "CORE ENGINE",
  items: [
    {
      id: "rails7",
      name: "Ruby on Rails 6/7/8",
      nodeClass: "Application Core",
      role: "Multi-tenant SaaS backbone — REST APIs, ActiveRecord, service objects, and subdomain routing.",
      deploymentNote: "Production PRM platform (CinnaLab) runs entirely on Rails 7 with zero critical incidents since launch.",
    },
    {
      id: "react",
      name: "React.js",
      nodeClass: "Application Core",
      role: "Client SPAs — dashboards, auth flows, integration-heavy UIs with role-based views.",
      deploymentNote: "Paired with Rails JSON APIs and ActionCable channels across 7 shipped SaaS products.",
    },
    {
      id: "sidekiq-core",
      name: "Sidekiq",
      nodeClass: "Application Core",
      role: "Background job orchestration — retries, idempotency, and dead-letter queues at the heart of every integration.",
      deploymentNote: "Powers CRM sync, billing webhooks, and email alerts without blocking request cycles.",
    },
  ],
};

export const FLOW_CLUSTERS = [
  {
    id: "frontend",
    label: "FRONTEND",
    items: [
      { id: "vite", name: "Vite", nodeClass: "Build Tool", role: "Fast dev/build pipeline for React SPAs.", deploymentNote: "Used on portfolio and production React client apps." },
      { id: "mui", name: "Material UI", nodeClass: "UI Library", role: "Component library with per-tenant dynamic theming.", deploymentNote: "CinnaLab partner portals use MUI theme overrides per company." },
      { id: "tailwind", name: "TailwindCSS", nodeClass: "UI Library", role: "Utility-first styling for rapid, consistent UI.", deploymentNote: "Portfolio and greenfield UI work." },
      { id: "redux", name: "Redux Toolkit", nodeClass: "State", role: "Global client state for complex dashboard flows.", deploymentNote: "Slices for auth, filters, and multi-step onboarding." },
    ],
  },
  {
    id: "data",
    label: "DATA LAYER",
    items: [
      { id: "postgres", name: "PostgreSQL", nodeClass: "Database", role: "Primary relational store — indexed faceted search, multi-tenant scoping.", deploymentNote: "40% faster search on 2,500+ listing dataset via index tuning." },
      { id: "redis", name: "Redis", nodeClass: "Cache / Queue", role: "Sidekiq backing store and ActionCable adapter.", deploymentNote: "Job retries and real-time pub/sub in production." },
      { id: "activejob", name: "ActiveJob", nodeClass: "Jobs", role: "Rails-native job abstraction over Sidekiq.", deploymentNote: "Idempotent CRM and billing sync handlers." },
      { id: "s3", name: "ActiveStorage / S3", nodeClass: "Storage", role: "File uploads and document storage.", deploymentNote: "AWS S3 in production deployments." },
    ],
  },
  {
    id: "infra",
    label: "INFRASTRUCTURE",
    items: [
      { id: "aws", name: "AWS", nodeClass: "Cloud", role: "IAM, VPC, EC2, RDS, S3, CloudWatch for production hosting.", deploymentNote: "Full-stack deploy ownership from VPC to app tier." },
      { id: "docker", name: "Docker", nodeClass: "Containers", role: "Consistent dev/prod environments and service isolation.", deploymentNote: "Self-hosted Documenso and Moodle in containers." },
      { id: "ghactions", name: "GitHub Actions", nodeClass: "CI/CD", role: "Automated test and deploy pipelines.", deploymentNote: "RSpec + Jest gates on every PR." },
      { id: "heroku", name: "Heroku", nodeClass: "PaaS", role: "Rapid staging and client demo deployments.", deploymentNote: "Used across consultancy client deliveries." },
    ],
  },
  {
    id: "integrations",
    label: "INTEGRATIONS",
    items: [
      { id: "shopify", name: "Shopify", nodeClass: "Commerce", role: "Admin GraphQL API, embedded admin app (App Bridge), webhooks, native returns and Liquid themes.", deploymentNote: "Midway Sports — order edits, refunds, fulfillment and an embedded admin app, with idempotent webhook handling." },
      { id: "vendor-edi", name: "Vendor EDI / SFTP", nodeClass: "Inventory Sync", role: "Multi-vendor inventory and order feeds with retry/backoff queues and streaming parsers.", deploymentNote: "Nike, S&S Activewear, Adidas Click and Perry Ellis (static-IP SFTP) syncing into Shopify." },
      { id: "hubspot", name: "HubSpot CRM", nodeClass: "CRM Sync", role: "Bi-directional partner data sync with conflict resolution.", deploymentNote: "CinnaLab ↔ HubSpot via idempotent Sidekiq jobs." },
      { id: "salesforce", name: "Salesforce", nodeClass: "CRM Sync", role: "Enterprise CRM bi-directional sync.", deploymentNote: "Deal registration and lead scoring pipeline." },
      { id: "qbo", name: "QuickBooks Online", nodeClass: "Finance", role: "Multi-entity bi-directional accounting sync.", deploymentNote: "Controllr/Monthend GAAP job-costing integration." },
      { id: "moodle", name: "Moodle LMS", nodeClass: "LMS", role: "Self-hosted e-learning with SSO embedding.", deploymentNote: "CinnaLab training paths synced to Moodle." },
    ],
  },
  {
    id: "payments",
    label: "PAYMENTS & AUTH",
    items: [
      { id: "stripe", name: "Stripe", nodeClass: "Payments", role: "Subscription microservice with idempotent webhooks.", deploymentNote: "Docyt Stripe-facing service — PCI-aligned handling." },
      { id: "paddle", name: "Paddle", nodeClass: "Payments", role: "Legacy subscription billing provider.", deploymentNote: "Full migration source in CinnaLab cutover." },
      { id: "chargebee", name: "Chargebee", nodeClass: "Payments", role: "Target billing platform post-migration.", deploymentNote: "Zero data loss Paddle → Chargebee migration." },
      { id: "devise", name: "Devise", nodeClass: "Auth", role: "Session-based authentication in production.", deploymentNote: "Zero auth incidents across shipped products." },
      { id: "pundit", name: "Pundit RBAC", nodeClass: "Auth", role: "Row-level role-based access control.", deploymentNote: "Partner / admin / manager roles on CinnaLab." },
      { id: "oauth", name: "OAuth 2.0", nodeClass: "Auth", role: "Google OAuth with token refresh handling.", deploymentNote: "Controllr/Monthend email + Google auth flows." },
    ],
  },
];

/** Edges from cluster → core (only `from` is used, to draw a connector into the core) */
export const FLOW_EDGES = [
  { from: "infra", to: "core" },
  { from: "integrations", to: "core" },
  { from: "frontend", to: "core" },
  { from: "data", to: "core" },
  { from: "payments", to: "core" },
];

export const ALL_FLOW_ITEMS = [
  ...FLOW_CORE.items,
  ...FLOW_CLUSTERS.flatMap(c => c.items),
];

export function getFlowItem(id) {
  return ALL_FLOW_ITEMS.find(i => i.id === id) ?? FLOW_CORE.items[0];
}