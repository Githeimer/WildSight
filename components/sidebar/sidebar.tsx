"use client";

import React, { useState } from 'react';

import { cn } from "@/lib/utils";
import { Home, Activity, BarChart2, Bell, ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Sidebar content - extracted to be reused in both desktop and mobile views
  const SidebarContent = () => (
    <>
      {/* App Title */}
      <div className={cn(
        "flex items-center gap-2 px-2 mb-6",
        collapsed && "justify-center"
      )}>
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600">🦌</span>
        </div>
        {!collapsed && <h1 className="text-lg font-semibold text-gray-800">Wildlife Tracker</h1>}
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        <SidebarItem icon={<Home size={20} />} label="Dashboard" active collapsed={collapsed} />
        <SidebarItem icon={<Activity size={20} />} label="Live Tracking" collapsed={collapsed} />
        <SidebarItem icon={<BarChart2 size={20} />} label="Analytics" collapsed={collapsed} />
        <SidebarItem icon={<Bell size={20} />} label="Alerts" collapsed={collapsed} />
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <SidebarItem 
          icon={<LogOut size={20} />} 
          label="Logout" 
          collapsed={collapsed}
          onClick={() => console.log("Logout clicked")}
        />
      </div>
    </>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className={cn(
      "relative h-screen bg-gray-50 border-r border-gray-200 hidden md:flex flex-col",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <SidebarContent />
      
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 -right-3 h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight size={14} />
        ) : (
          <ChevronLeft size={14} />
        )}
      </Button>
    </div>
  );

  // Mobile sidebar using Sheet component from shadcn
  const MobileSidebar = () => (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-full p-4 flex flex-col">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick
}) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 w-full p-2 rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center" : "",
        active 
          ? "bg-emerald-100 text-emerald-700" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

export default Sidebar;