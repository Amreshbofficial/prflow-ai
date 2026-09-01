import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Bot,
  FileText,
  Contact,
  List
} from "lucide-react";

export const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  // Lead Statuses
  "New": "info",
  "Researching": "warning",
  "Contacted": "default",
  "Replied": "success",
  "Qualified": "success",
  "Converted": "success",
  "Not Interested": "error",
  "Archived": "default",
  
  // Outreach Statuses
  "Draft": "warning",
  "Ready": "info",
  "Sent": "success",
  "Opened": "success",
  
  // Follow-up Statuses
  "Scheduled": "info",
  "Completed": "success",
  "Overdue": "error",
};

export type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  comingSoon?: boolean;
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

export const SIDEBAR_NAVIGATION: NavigationSection[] = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Leads", href: "/dashboard/leads", icon: Users },
      { name: "Outreach", href: "/dashboard/outreach", icon: MessageSquare },
      { name: "Follow-ups", href: "/dashboard/followups", icon: Calendar },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { name: "AI Assistant", href: "/dashboard/tools/assistant", icon: Bot, comingSoon: true },
      { name: "Templates", href: "/dashboard/tools/templates", icon: FileText, comingSoon: true },
      { name: "Media Lists", href: "/dashboard/tools/lists", icon: List, comingSoon: true },
      { name: "Contacts", href: "/dashboard/tools/contacts", icon: Contact, comingSoon: true },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
    ],
  },
];
