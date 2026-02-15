
"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { ArrowLeft, UserPlus, Trash2, Users } from "lucide-react";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { toast } from "@/hooks/ui/use-toast";
import { useApp } from "@/hooks/state/use-app";
import { useOrganization } from "@/hooks/state/use-organization";

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

/**
 * AccountTeamDetailPage - 職責：管理特定團隊內的成員 (Team Member 清單)
 */
export default function AccountTeamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { state } = useApp();
  const { organizations, activeAccount } = state;
  const { updateTeamMembers } = useOrganization();
  const activeOrgId = activeAccount?.id;
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    activeOrgId ? organizations[activeOrgId] : null,
    [organizations, activeOrgId]
  );
  
  const team = activeOrg?.teams?.find(t => t.id === id);

  if (!mounted) return null;
  if (!activeOrg || !team) return <div className="p-20 text-center">Team not found.</div>;

  const allMembers = activeOrg.members || [];
  const teamMemberIds = team.memberIds || [];

  const teamMembers = allMembers.filter(m => teamMemberIds.includes(m.id));
  const otherOrgMembers = allMembers.filter(m => !teamMemberIds.includes(m.id) && !m.isExternal);

  const handleMemberToggle = async (memberId: string, action: 'add' | 'remove') => {
    try {
      await updateTeamMembers(team.id, memberId, action);
      toast({ title: action === 'add' ? "Member Assigned" : "Member Removed" });
    } catch (e: any) {
      console.error("Error updating team members:", e);
      toast({
        variant: "destructive",
        title: `Failed to ${action === 'add' ? 'Add' : 'Remove'} Member`,
        description: e.message || "An unknown error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest">Internal Team Management / {team.name}</span>
      </div>

      <PageHeader 
        title={team.name} 
        description={team.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Team Members ({teamMembers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map(member => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {member.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleMemberToggle(member.id, 'remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {teamMembers.length === 0 && (
              <div className="col-span-full p-12 border-2 border-dashed rounded-xl text-center">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-10" />
                <p className="text-xs text-muted-foreground">No members are currently assigned to this team.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Available Members</h3>
          <Card className="border-border/60 bg-muted/5">
            <CardContent className="p-4 space-y-4">
              {otherOrgMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-[10px]">
                      {member.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-medium">{member.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary" onClick={() => handleMemberToggle(member.id, 'add')}>
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
              ))}
              {otherOrgMembers.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground italic py-4">
                  All internal members have been assigned to a team.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
