"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { 
  Home, 
  Activity, 
  BarChart2, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Menu,
  X,
  LucideIcon
} from "lucide-react";

// Import shadcn UI components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { signOut } from 'next-auth/react';

// TypeScript interfaces
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
}

interface SidebarProps {
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  active = false,
  collapsed = false,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const linkContent = (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
        "hover:scale-[1.02] duration-200",
        collapsed ? "justify-center" : "",
        active 
          ? "bg-emerald-50 text-emerald-700 shadow-sm" 
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <span className={cn(
        "flex items-center justify-center",
        active ? "text-emerald-600" : "text-gray-500"
      )}>
        {icon}
      </span>
      
      {!collapsed && (
        <span className={cn(
          "transition-all duration-200",
          active ? "text-emerald-700 font-medium" : ""
        )}>
          {label}
        </span>
      )}
    </Link>
  );

  // Add tooltips when sidebar is collapsed
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Define navigation items
  const navigationItems: NavigationItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/" },
    {icon: <Home size={20} />, label: "Register Animal", href: "/animal/register" },
    { icon: <Activity size={20} />, label: "Live Tracking", href: "/livetracking" },
    { icon: <BarChart2 size={20} />, label: "Analytics", href: "/analytics" },
    { icon: <Bell size={20} />, label: "Alerts", href: "/alerts" }
  ];
  
  // Logout item
  const logoutItem: NavigationItem = { 
    icon: <LogOut size={20} />, 
    label: "Logout", 
    href: "#",
    onClick: () => {
      signOut();
      // Implement your logout logic here
    } 
  };

  // Check if a route is active
  const isActive = (href: string): boolean => {
    if (href === "#") return false;
    return pathname === href;
  };

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* App Title with Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16",
        collapsed ? "justify-center" : ""
      )}>
      
        
        {!collapsed && (
          <h1 className="pl-3 text-3xl font-bold tracking-tight">
            Wild<span className='text-green-600'>Sight</span>
          </h1>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Main Navigation */}
      <div className="px-3 space-y-1.5">
        {navigationItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={isActive(item.href)}
            collapsed={collapsed}
            onClick={item.onClick}
          />
        ))}
      </div>

      {/* Separator before logout */}
      <Separator className="my-4" />

      {/* Logout Button */}
      <div className="px-3">
        <NavItem
          icon={logoutItem.icon}
          label={logoutItem.label}
          href={logoutItem.href}
          collapsed={collapsed}
          onClick={logoutItem.onClick}
        />
      </div>

      {/* Spacer to push content to the top */}
      <div className="flex-1" />
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "relative h-screen bg-white border-r border-gray-200 py-4 hidden md:flex flex-col",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        <SidebarContent />
        
        {/* Collapse Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-5 -right-3 h-6 w-6 rounded-full shadow-sm p-0 border-gray-200"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full shadow-md"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 pt-0">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 h-16 border-b">
                <h2 className="font-medium">Navigation</h2>
                <SheetClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    aria-label="Close navigation menu"
                  >
                    <X size={18} />
                  </Button>
                </SheetClose>
              </div>
              <div className="flex-1 overflow-auto py-4">
                <SidebarContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;