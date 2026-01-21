import { Mail, Phone, Building2, Shield, Calendar, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const profileData = {
  name: 'Alex Thompson',
  email: 'alex.thompson@company.com',
  phone: '+1 (555) 123-4567',
  role: 'Operations Manager',
  department: 'Supply Chain',
  joinDate: 'March 2022',
  avatar: '',
  permissions: ['View Inventory', 'Manage Warehouses', 'Create Movements', 'View Reports', 'Manage Alerts'],
  recentActivity: [
    { action: 'Created inbound movement', target: 'Widget Pro Max - 500 units', time: '2 hours ago' },
    { action: 'Updated warehouse capacity', target: 'Central Hub', time: '5 hours ago' },
    { action: 'Resolved stock alert', target: 'Safety Equipment - SE-508', time: '1 day ago' },
    { action: 'Added new zone', target: 'Zone D - Returns', time: '2 days ago' },
  ],
};

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Profile Header */}
        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">
                    {profileData.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{profileData.department}</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Contact & Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profileData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{profileData.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{profileData.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Permissions</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.permissions.map((permission) => (
                <Badge
                  key={permission}
                  variant="outline"
                  className="bg-muted/50"
                >
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {profileData.recentActivity.map((activity, index) => (
              <div key={index}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.target}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
                {index < profileData.recentActivity.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
