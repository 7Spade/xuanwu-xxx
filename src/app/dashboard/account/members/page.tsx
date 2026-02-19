
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { UserPlus, Trash2, Mail, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/ui/use-toast";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { MemberReference } from "@/types/domain";
import { useApp } from "@/hooks/state/use-app";
import { useOrganization } from "@/hooks/state/use-organization";
import { useI18n } from "@/context/i18n-context";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: ReactNode;
}

function PageHeader({ title, description, children, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-4xl font-bold tracking-tight font-headline">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

export default function AccountMembersPage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();
  const { state } = useApp();
  const { accounts, activeAccount } = state;
  const { recruitMember, dismissMember } = useOrganization();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  );

  if (!mounted) return null;

  if (!activeOrg) {
    return (
        <div className="p-8 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <h3 className="font-bold">{t('account.governanceNotAvailable')}</h3>
            <p className="text-sm text-muted-foreground">
                {t('account.governanceNotAvailableDescription')}
            </p>
        </div>
      )
  }

  const members = activeOrg.members || [];

  const handleRecruitMember = async () => {
    const newId = `m-${Math.random().toString(36).slice(-4)}`;
    const name = "New Researcher";
    const email = `user-${newId}@orgverse.io`;
    
    try {
      await recruitMember(newId, name, email);
      toast({ title: t('account.identityResonanceActivated'), description: t('account.identityResonanceDescription') });
    } catch (error: unknown) {
      console.error("Error recruiting member:", error);
      const message = error instanceof Error ? error.message : t('common.unknownError');
      toast({
        variant: "destructive",
        title: t('account.failedToRecruitMember'),
        description: message,
      });
    }
  };

  const handleDismissMember = async (member: MemberReference) => {
    try {
      await dismissMember(member);
      toast({ title: t('account.identityDeregistered'), description: t('account.memberRemoved', { name: member.name }), variant: "destructive" });
    } catch (error: unknown) {
      console.error("Error dismissing member:", error);
      const message = error instanceof Error ? error.message : t('common.unknownError');
      toast({
        variant: "destructive",
        title: t('account.failedToDismissMember'),
        description: message,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title={t('account.membersTitle')} 
        description={t('account.membersDescription', { name: activeOrg.name })}
      >
        <Button className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-primary/20" onClick={handleRecruitMember}>
          <UserPlus className="w-4 h-4" /> {t('account.recruitNewMember')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="border-border/60 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {member.name?.[0] || 'U'}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                  <CardDescription className="text-[10px] font-mono opacity-60">{member.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 mt-2">
                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-primary/5 px-2 py-0.5 border-primary/20 text-primary">
                  {member.role}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${member.presence === 'active' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{member.presence}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest gap-2">
                  <Mail className="w-3 h-3" /> {t('account.contact')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDismissMember(member)}
                  disabled={member.role === 'Owner'}
                  className="h-8 hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
