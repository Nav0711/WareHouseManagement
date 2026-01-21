import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-16 lg:ml-64 transition-all duration-300">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
