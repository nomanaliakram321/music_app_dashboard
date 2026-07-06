import {
  Calendar,
  Disc3,
  FolderOpen,
  Home,
  Upload,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Events", url: "/events", icon: FolderOpen },
  { title: "Albums", url: "/albums", icon: Disc3 },
  // { title: "Users", url: "/users", icon: Users }, // Hidden per user request
  { title: "Upload Data", url: "/upload", icon: Upload },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex items-center gap-3 border-b border-border p-4">
        <img
          src="/logo.png"
          alt="Hip Hop Calendar"
          className="h-8 w-8 rounded object-contain"
        />
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Hip Hop Calendar
        </h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
