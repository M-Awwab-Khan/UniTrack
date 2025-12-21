"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { STUDENT_NAV_ROUTES, ADMIN_NAV_ROUTES } from "@/lib/navigation";
import { Logo } from "@/components/sidebar/logo";
import DashboardNavigation from "@/components/sidebar/nav-main";
import { NotificationsPopover } from "@/components/sidebar/nav-notifications";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { GraduationCap } from "lucide-react";
import React from "react";

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const { data: session } = authClient.useSession();
  const isCollapsed = state === "collapsed";

  const userRole = session?.user?.role || "student";
  const routes = userRole === "admin" ? ADMIN_NAV_ROUTES : STUDENT_NAV_ROUTES;

  return (
    <Sidebar variant="inset" collapsible="icon" className={className} {...props}>
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-center md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="/" className="flex items-center gap-3 px-1">
          <GraduationCap className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              UniTrack
            </span>
          )}
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* We could potentially hide this or link it to our real notifications */}
          {/* <NotificationsPopover notifications={[]} /> */}
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={routes} />
      </SidebarContent>
      <SidebarFooter className="!p-0 px-2 !pb-4">
        {/* We can put user info here or keep it empty for now as requested UI consistency is main goal */}
        <div className={cn("flex items-center gap-2 px-2", isCollapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || "User avatar"} className="h-full w-full object-cover" />
            ) : (
              <span>{session?.user?.name?.[0] || "U"}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{session?.user?.name}</span>
              <span className="text-xs text-muted-foreground mt-1 capitalize">{userRole.toUpperCase()}</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

