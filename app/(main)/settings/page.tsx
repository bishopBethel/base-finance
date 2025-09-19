'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { Settings, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { state, actions } = useStore();
  const { toast } = useToast();

  const handleToggleLocalStorage = () => {
    actions.toggleLocalStorage();
    toast({
      title: state.useLocalStorage ? 'Local storage disabled' : 'Local storage enabled',
      description: state.useLocalStorage 
        ? 'Data will no longer persist between sessions.'
        : 'Data will now persist between browser sessions.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your payroll application preferences and data management.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Persistence
            </CardTitle>
            <CardDescription>
              Control how your data is stored and persisted across browser sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="localStorage">Save to Local Storage</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, all changes will be saved to your browser's local storage
                </p>
              </div>
              <Switch
                id="localStorage"
                checked={state.useLocalStorage}
                onCheckedChange={handleToggleLocalStorage}
              />
            </div>
            <div className="pt-2">
              <Badge variant={state.useLocalStorage ? 'default' : 'secondary'}>
                {state.useLocalStorage ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Application theme and appearance preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Dark mode is enforced for optimal user experience
                  </p>
                </div>
                <Badge>Dark Mode</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Reference Data
            </CardTitle>
            <CardDescription>
              Manage departments, roles, and other reference data used throughout the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Departments</h4>
                <div className="space-y-1">
                  {state.departments.map((dept) => (
                    <Badge key={dept.id} variant="outline">
                      {dept.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Roles</h4>
                <div className="space-y-1">
                  {state.roles.slice(0, 5).map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                  {state.roles.length > 5 && (
                    <Badge variant="secondary">
                      +{state.roles.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}