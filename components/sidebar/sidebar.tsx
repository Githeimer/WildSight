
import React from 'react';
import { cn } from "@/lib/utils";
import { Home, Activity, BarChart2, Bell } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <div className={cn("w-64 bg-gray-50 h-screen p-4 flex flex-col", className)}>
      {/* App Title */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600">🦌</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Wildlife Tracker</h1>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        <SidebarItem icon={<Home size={20} />} label="Dashboard" active />
        <SidebarItem icon={<Activity size={20} />} label="Live Tracking" />
        <SidebarItem icon={<BarChart2 size={20} />} label="Analytics" />
        <SidebarItem icon={<Bell size={20} />} label="Alerts" />
      </nav>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  onClick
}) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 w-full p-2 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-emerald-100 text-emerald-700" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
      onClick={onClick}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default Sidebar;