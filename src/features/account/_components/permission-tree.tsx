
"use client";

import { Badge } from "@/shared/shadcn-ui/badge";
import { Card, CardContent } from "@/shared/shadcn-ui/card";
import { Shield } from "lucide-react";
import { type OrganizationRole } from "@/shared/types";

interface PermissionTreeProps {
  currentRole: OrganizationRole;
  t: (key: string) => string;
}

function PermissionTier({ name, description, active }: { name: string, description: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 transition-all duration-300 ${active ? 'bg-primary/5' : 'opacity-60 grayscale-[0.5]'}`}>
      <div className={`size-2 rounded-full ${active ? 'animate-pulse bg-primary' : 'bg-muted'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${active ? 'text-primary' : ''}`}>{name}</h4>
        <p className="text-[10px] leading-tight text-muted-foreground">{description}</p>
      </div>
      {active && <Badge className="h-4 border-primary/20 bg-primary/10 text-[9px] text-primary">Current Role</Badge>}
    </div>
  );
}

export function PermissionTree({ currentRole, t }: PermissionTreeProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-headline text-xl font-bold tracking-tight">Permission Constellation</h2>
      <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Current Model</span>
          </div>
          <Badge variant="outline" className="bg-background text-[9px] font-bold uppercase tracking-tighter">Progressive Access</Badge>
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
