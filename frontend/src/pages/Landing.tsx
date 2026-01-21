import { Link } from 'react-router-dom';
import { ArrowRight, Warehouse, Package, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  {
    icon: Warehouse,
    title: 'Multi-Warehouse Management',
    description: 'Manage multiple warehouses from a single dashboard with real-time visibility.',
  },
  {
    icon: Package,
    title: 'Smart Inventory Tracking',
    description: 'Track inventory levels across zones and bins with automated low-stock alerts.',
  },
  {
    icon: TrendingUp,
    title: 'Movement Analytics',
    description: 'Monitor inbound, outbound, and transfer movements with detailed analytics.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Role-based access control with full audit trails and compliance reporting.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Instant synchronization across all devices and team members.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Reporting',
    description: 'Generate custom reports and export data for business intelligence.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary animate-glow">
              <Warehouse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">WTMS</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-chart-2/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Zap className="h-4 w-4" />
              Enterprise-grade warehouse management
            </span>
          </div>
          
          <h1 className="animate-slide-up opacity-0 mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6" style={{ animationDelay: '0.2s' }}>
            Streamline Your{' '}
            <span className="gradient-text">Warehouse Operations</span>
          </h1>
          
          <p className="animate-slide-up opacity-0 mx-auto max-w-2xl text-lg text-muted-foreground mb-10" style={{ animationDelay: '0.3s' }}>
            A comprehensive solution for managing warehouses, inventory, and stock movements.
            Built for operations teams who demand efficiency and reliability.
          </p>
          
          <div className="animate-slide-up opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.4s' }}>
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8 transition-all duration-300 hover:shadow-glow-lg hover:scale-105">
                Start Managing
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-base px-8 transition-all duration-300 hover:border-primary/50">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for enterprise warehouse management
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-glow animate-slide-up opacity-0"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of operations teams already using WTMS to streamline their warehouse management.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 transition-all duration-300 hover:shadow-glow-lg">
                  Access Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Warehouse className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">WTMS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 WTMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
