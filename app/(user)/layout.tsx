import React from 'react';
import Sidebar from '@/components/sidebar/sidebar';
import AlertStatusCard from '@/components/sidebar/AlertStatusCard';
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
  <main className='flex-1 overflow-auto p-6'>
    {children}
    </main>
    </div>
  );
}