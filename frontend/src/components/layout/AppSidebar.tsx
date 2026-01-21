import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Warehouses', path: '/warehouses', icon: Warehouse },
  { title: 'Zones & Bins', path: '/zones', icon: Boxes },
  { title: 'Inventory', path: '/inventory', icon: Package },
  { title: 'Stock Movements', path: '/movements', icon: ArrowLeftRight },
  { title: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { title: 'Profile', path: '/profile', icon: User },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Warehouse className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">WTMS</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'animate-scale-in')} />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="border-t border-border p-4">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
            {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
