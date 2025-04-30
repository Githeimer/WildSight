import React from 'react';
import Sidebar from '@/components/sidebar/sidebar';
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