
"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/shadcn-ui/command";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Globe, Layers, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Account, Workspace, MemberReference } from "@/types/domain";

interface GlobalSearchProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  organizations: Account[];
  workspaces: Workspace[];
  members: MemberReference[];
  activeOrgId: string | null;
  onSwitchOrg: (org: Account) => void;
}

export function GlobalSearch({
  isOpen,
  onOpenChange,
  organizations,
  workspaces,
  members,
  activeOrgId,
  onSwitchOrg,
}: GlobalSearchProps) {
  const router = useRouter();

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Dimensions">
          {organizations.map((org) => (
            <CommandItem key={org.id} onSelect={() => handleSelect(() => onSwitchOrg(org))}>
              <Globe className="mr-2 h-4 w-4 text-primary" />
              <span>{org.name}</span>
              {activeOrgId === org.id && <Badge variant="outline" className="text-[8px] h-4 ml-auto">Current</Badge>}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Spaces">
          {workspaces.map((ws) => (
            <CommandItem key={ws.id} onSelect={() => handleSelect(() => router.push(`/dashboard/workspaces/${ws.id}`))}>
              <Layers className="mr-2 h-4 w-4 text-primary" />
              <span>{ws.name}</span>
              <span className="text-[9px] text-muted-foreground font-mono ml-auto">{ws.id.toUpperCase()}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {members.map((member) => (
            <CommandItem key={member.id} onSelect={() => handleSelect(() => router.push('/dashboard/account/members'))}>
              <User className="mr-2 h-4 w-4 text-primary" />
              <span>{member.name}</span>
              <span className="text-[9px] text-muted-foreground ml-auto">{member.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
