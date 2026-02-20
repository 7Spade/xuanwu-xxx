
"use client";

import { Badge } from "@/shared/shadcn-ui/badge";
import { Card, CardContent } from "@/shared/shadcn-ui/card";
import { Shield } from "lucide-react";
import { OrganizationRole } from "@/domain-types/domain";

interface PermissionTreeProps {
  currentRole: OrganizationRole;
  t: (key: string) => string;
}

function PermissionTier({ name, description, active }: { name: string, description: string, active: boolean }) {
  return (
    <div className={`p-4 flex items-center gap-4 transition-all duration-300 ${active ? 'bg-primary/5' : 'grayscale-[0.5] opacity-60'}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${active ? 'text-primary' : ''}`}>{name}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
      {active && <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-primary/20">Current Role</Badge>}
    </div>
  );
}

export function PermissionTree({ currentRole, t }: PermissionTreeProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-headline tracking-tight">Permission Constellation</h2>
      <Card className="border-border/60 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-4 bg-primary/5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Current Model</span>
          </div>
          <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold tracking-tighter">Progressive Access</Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            <PermissionTier 
              name={t('dashboard.roleOwner')}
              description={t('dashboard.roleOwnerDescription')}
              active={currentRole === 'Owner'} 
            />
            <PermissionTier 
              name={t('dashboard.roleAdmin')}
              description={t('dashboard.roleAdminDescription')}
              active={currentRole === 'Admin'} 
            />
            <PermissionTier 
              name={t('dashboard.roleMember')}
              description={t('dashboard.roleMemberDescription')}
              active={currentRole === 'Member'} 
            />
            <PermissionTier 
              name={t('dashboard.roleGuest')}
              description={t('dashboard.roleGuestDescription')}
              active={currentRole === 'Guest'} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
