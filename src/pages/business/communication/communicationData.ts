export type BusinessChannel = "WhatsApp" | "SMS" | "Email" | "Push";
export type MessageStatus = "Draft" | "Scheduled" | "Sending" | "Sent" | "Delivered" | "Read" | "Failed" | "Cancelled";
export type RuleStatus = "Active" | "Paused" | "Archived";
export type TemplateApprovalStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Archived";

export interface BusinessConversation {
  id: string;
  customer: string;
  company?: string;
  channel: BusinessChannel;
  latestMessage: string;
  relatedRecord: string;
  owner: string;
  priority: "High" | "Medium" | "Normal";
  status: "Open" | "Waiting" | "Resolved";
  lastActivity: string;
}

export interface BusinessCampaign {
  id: string;
  name: string;
  segment: string;
  channels: BusinessChannel[];
  status: MessageStatus;
  scheduledAt: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface BusinessCommunicationRule {
  id: string;
  name: string;
  trigger: "Booking Created" | "Booking Reminder" | "Payment Link Sent" | "Payment Success" | "Booking Cancelled" | "Lead Created";
  scope: "All Services" | "Service Category" | "Specific Service" | "Customer Segment";
  channel: BusinessChannel;
  template: string;
  timing: "Immediate" | "Before 1 hour" | "Before 2 hours" | "Before 24 hours" | "After completion";
  status: RuleStatus;
}

export interface BusinessMessageTemplate {
  id: string;
  name: string;
  category: "Booking" | "Payment" | "Promotion" | "Lead" | "General";
  channel: BusinessChannel;
  language: string;
  variables: string[];
  approvalStatus: TemplateApprovalStatus;
  status: "Active" | "Paused" | "Archived";
}

export interface BusinessMessageLog {
  id: string;
  messageId: string;
  customer: string;
  channel: BusinessChannel;
  recipient: string;
  status: "Queued" | "Sent" | "Delivered" | "Read" | "Failed";
  sentAt: string;
  deliveredAt: string;
  error?: string;
}

export type AnnouncementAudience = "All Customers" | "CRM Segment" | "Staff" | "Counter Team";
export type AnnouncementStatus = "Draft" | "Scheduled" | "Published" | "Expired" | "Archived";
export type AnnouncementPriority = "Normal" | "Important" | "Urgent";

export interface BusinessAnnouncement {
  id: string;
  title: string;
  summary: string;
  category: string;
  audience: AnnouncementAudience;
  segment?: string;
  channels: BusinessChannel[];
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishAt: string;
  expiryAt?: string;
  pinned: boolean;
  views: number;
}

export type NotificationType =
  | "Delivery"
  | "Campaign"
  | "Automation"
  | "Booking"
  | "Template"
  | "System";

export interface BusinessNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  source: string;
  priority: "Normal" | "High";
  read: boolean;
  createdAt: string;
}

export const conversations: BusinessConversation[] = [
  {
    id: "CONV-001",
    customer: "Rajesh Sharma",
    channel: "WhatsApp",
    latestMessage: "Can you resend the payment link for Gruhapravesha?",
    relatedRecord: "BKG-2026-001",
    owner: "Counter Team",
    priority: "High",
    status: "Open",
    lastActivity: "Today 10:42",
  },
  {
    id: "CONV-002",
    customer: "Greenfield Events",
    company: "Corporate",
    channel: "Email",
    latestMessage: "Please share revised catering quotation for 120 guests.",
    relatedRecord: "Lead: Corporate Catering",
    owner: "Ops Lead",
    priority: "Medium",
    status: "Waiting",
    lastActivity: "Today 09:15",
  },
  {
    id: "CONV-003",
    customer: "Meera Iyer",
    channel: "SMS",
    latestMessage: "Booking reminder delivered for tomorrow's consultation.",
    relatedRecord: "BKG-2026-004",
    owner: "System",
    priority: "Normal",
    status: "Resolved",
    lastActivity: "Yesterday 18:05",
  },
  {
    id: "CONV-004",
    customer: "Anil Kumar",
    channel: "WhatsApp",
    latestMessage: "Customer asked for hotel package photos.",
    relatedRecord: "Lead: Hotel Package",
    owner: "Sales",
    priority: "Medium",
    status: "Open",
    lastActivity: "Yesterday 16:21",
  },
];

export const campaigns: BusinessCampaign[] = [
  {
    id: "CMP-001",
    name: "Wedding Season Packages",
    segment: "Wedding",
    channels: ["WhatsApp", "Email"],
    status: "Scheduled",
    scheduledAt: "2026-06-25 10:00",
    sent: 0,
    delivered: 0,
    failed: 0,
  },
  {
    id: "CMP-002",
    name: "Repeat Customer Offer",
    segment: "Repeat Customers",
    channels: ["SMS", "WhatsApp"],
    status: "Sent",
    scheduledAt: "2026-06-18 09:30",
    sent: 48,
    delivered: 46,
    failed: 2,
  },
  {
    id: "CMP-003",
    name: "Corporate Catering Follow-up",
    segment: "Corporate Accounts",
    channels: ["Email"],
    status: "Delivered",
    scheduledAt: "2026-06-20 11:00",
    sent: 18,
    delivered: 18,
    failed: 0,
  },
];

export const automationRules: BusinessCommunicationRule[] = [
  {
    id: "RULE-001",
    name: "Booking Confirmation",
    trigger: "Booking Created",
    scope: "All Services",
    channel: "WhatsApp",
    template: "TPL-001",
    timing: "Immediate",
    status: "Active",
  },
  {
    id: "RULE-002",
    name: "Slot Reminder",
    trigger: "Booking Reminder",
    scope: "All Services",
    channel: "SMS",
    template: "TPL-002",
    timing: "Before 2 hours",
    status: "Active",
  },
  {
    id: "RULE-003",
    name: "Payment Success Receipt",
    trigger: "Payment Success",
    scope: "All Services",
    channel: "Email",
    template: "TPL-003",
    timing: "Immediate",
    status: "Active",
  },
  {
    id: "RULE-004",
    name: "Dormant Lead Follow-up",
    trigger: "Lead Created",
    scope: "Customer Segment",
    channel: "WhatsApp",
    template: "TPL-004",
    timing: "After completion",
    status: "Paused",
  },
];

export const templates: BusinessMessageTemplate[] = [
  {
    id: "TPL-001",
    name: "Booking Confirmation",
    category: "Booking",
    channel: "WhatsApp",
    language: "English",
    variables: ["{{CustomerName}}", "{{BusinessName}}", "{{ServiceName}}", "{{BookingDate}}", "{{SlotTime}}"],
    approvalStatus: "Approved",
    status: "Active",
  },
  {
    id: "TPL-002",
    name: "Booking Reminder",
    category: "Booking",
    channel: "SMS",
    language: "English",
    variables: ["{{CustomerName}}", "{{ServiceName}}", "{{SlotTime}}", "{{BranchName}}"],
    approvalStatus: "Approved",
    status: "Active",
  },
  {
    id: "TPL-003",
    name: "Payment Receipt",
    category: "Payment",
    channel: "Email",
    language: "English",
    variables: ["{{CustomerName}}", "{{Amount}}", "{{ServiceName}}", "{{BusinessName}}"],
    approvalStatus: "Approved",
    status: "Active",
  },
  {
    id: "TPL-004",
    name: "Payment Link Follow-up",
    category: "Lead",
    channel: "WhatsApp",
    language: "English",
    variables: ["{{CustomerName}}", "{{PaymentLink}}", "{{BusinessName}}"],
    approvalStatus: "Pending Approval",
    status: "Paused",
  },
];

export const logs: BusinessMessageLog[] = [
  {
    id: "LOG-001",
    messageId: "MSG-001",
    customer: "Rajesh Sharma",
    channel: "WhatsApp",
    recipient: "+91 98765 43210",
    status: "Read",
    sentAt: "2026-06-23 10:42:01",
    deliveredAt: "2026-06-23 10:42:04",
  },
  {
    id: "LOG-002",
    messageId: "MSG-002",
    customer: "Meera Iyer",
    channel: "SMS",
    recipient: "+91 65432 10987",
    status: "Delivered",
    sentAt: "2026-06-22 18:05:00",
    deliveredAt: "2026-06-22 18:05:03",
  },
  {
    id: "LOG-003",
    messageId: "CMP-002",
    customer: "Priya Menon",
    channel: "WhatsApp",
    recipient: "+91 87654 32109",
    status: "Failed",
    sentAt: "2026-06-18 09:30:11",
    deliveredAt: "-",
    error: "Provider rejected recipient",
  },
  {
    id: "LOG-004",
    messageId: "MSG-004",
    customer: "Greenfield Events",
    channel: "Email",
    recipient: "ops@greenfield.example",
    status: "Delivered",
    sentAt: "2026-06-20 11:00:00",
    deliveredAt: "2026-06-20 11:00:08",
  },
];

export const announcements: BusinessAnnouncement[] = [
  {
    id: "ANN-001",
    title: "Monsoon Wedding Package — 15% Off",
    summary: "Limited-time discount on full wedding catering and priest services.",
    category: "Promotion",
    audience: "CRM Segment",
    segment: "Wedding Season",
    channels: ["WhatsApp", "Email"],
    priority: "Important",
    status: "Published",
    publishAt: "2026-06-20 09:00",
    expiryAt: "2026-07-31",
    pinned: true,
    views: 1240,
  },
  {
    id: "ANN-002",
    title: "New Counter Booking Hours",
    summary: "Weekend counter bookings now open 7 AM – 8 PM.",
    category: "Operations",
    audience: "All Customers",
    channels: ["SMS", "Push"],
    priority: "Normal",
    status: "Published",
    publishAt: "2026-06-18 08:00",
    pinned: false,
    views: 892,
  },
  {
    id: "ANN-003",
    title: "GST Invoice Format Update",
    summary: "Finance team: use revised invoice template from 1 July.",
    category: "Policy",
    audience: "Staff",
    channels: ["Email"],
    priority: "Important",
    status: "Scheduled",
    publishAt: "2026-06-28 10:00",
    pinned: false,
    views: 0,
  },
  {
    id: "ANN-004",
    title: "Corporate Catering Menu Refresh",
    summary: "Updated packages for 50+ guest events.",
    category: "Service Update",
    audience: "CRM Segment",
    segment: "Corporate Accounts",
    channels: ["Email"],
    priority: "Normal",
    status: "Draft",
    publishAt: "-",
    pinned: false,
    views: 0,
  },
  {
    id: "ANN-005",
    title: "Payment Link Expiry Reminder",
    summary: "Counter team: remind customers that payment links expire in 24 hours.",
    category: "Operations",
    audience: "Counter Team",
    channels: ["Push"],
    priority: "Urgent",
    status: "Published",
    publishAt: "2026-06-22 07:30",
    expiryAt: "2026-06-30",
    pinned: true,
    views: 48,
  },
];

export const notifications: BusinessNotification[] = [
  {
    id: "NTF-001",
    title: "WhatsApp delivery failed",
    message: "MSG-003 to Priya Menon — provider rejected recipient.",
    type: "Delivery",
    source: "Communication Logs",
    priority: "High",
    read: false,
    createdAt: "2026-06-23 10:42",
  },
  {
    id: "NTF-002",
    title: "Campaign sent successfully",
    message: "Repeat Customer Offer reached 48 customers (46 delivered).",
    type: "Campaign",
    source: "Campaigns",
    priority: "Normal",
    read: false,
    createdAt: "2026-06-23 09:15",
  },
  {
    id: "NTF-003",
    title: "Booking confirmation sent",
    message: "Automation RULE-001 triggered for BKG-2026-001.",
    type: "Automation",
    source: "Automations",
    priority: "Normal",
    read: true,
    createdAt: "2026-06-23 08:30",
  },
  {
    id: "NTF-004",
    title: "New online booking",
    message: "Meera Iyer booked Gruhapravesha Pooja for 2026-08-15.",
    type: "Booking",
    source: "Booking Management",
    priority: "Normal",
    read: false,
    createdAt: "2026-06-22 18:05",
  },
  {
    id: "NTF-005",
    title: "Template pending approval",
    message: "Payment Link Follow-up (TPL-004) awaits WhatsApp template review.",
    type: "Template",
    source: "Templates",
    priority: "High",
    read: true,
    createdAt: "2026-06-22 14:20",
  },
  {
    id: "NTF-006",
    title: "Announcement published",
    message: "Monsoon Wedding Package is now live for Wedding Season segment.",
    type: "System",
    source: "Announcements",
    priority: "Normal",
    read: true,
    createdAt: "2026-06-20 09:01",
  },
];

export function statusTone(status: string) {
  if (["Active", "Approved", "Sent", "Delivered", "Read", "Resolved", "Published"].includes(status)) return "success" as const;
  if (["Scheduled", "Pending Approval", "Waiting", "Sending", "Queued"].includes(status)) return "info" as const;
  if (["Paused", "Draft", "Open", "Expired", "Archived"].includes(status)) return "warning" as const;
  if (["Failed", "Rejected", "Cancelled"].includes(status)) return "destructive" as const;
  return "neutral" as const;
}
