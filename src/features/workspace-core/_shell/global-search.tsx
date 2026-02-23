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
import { type Account, type Workspace, type MemberReference } from "@/shared/types";
import { ROUTES } from "@/shared/constants/routes";

interface GlobalSearchProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  organizations: Account[];
  workspaces: Workspace[];
  members: MemberReference[];
  activeOrganizationId: string | null;
  onSwitchOrganization: (organization: Account) => void;
}

export function GlobalSearch({
  isOpen,
  onOpenChange,
  organizations,
  workspaces,
  members,
  activeOrganizationId,
  onSwitchOrganization,
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
          {organizations.map((organization) => (
            <CommandItem key={organization.id} onSelect={() => handleSelect(() => onSwitchOrganization(organization))}>
              <Globe className="mr-2 size-4 text-primary" />
              <span>{organization.name}</span>
              {activeOrganizationId === organization.id && <Badge variant="outline" className="ml-auto h-4 text-[8px]">Current</Badge>}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Spaces">
          {workspaces.map((workspace) => (
            <CommandItem key={workspace.id} onSelect={() => handleSelect(() => router.push(`${ROUTES.WORKSPACES}/${workspace.id}`))}>
              <Layers className="mr-2 size-4 text-primary" />
              <span>{workspace.name}</span>
              <span className="ml-auto font-mono text-[9px] text-muted-foreground">{workspace.id.toUpperCase()}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {members.map((member) => (
            <CommandItem key={member.id} onSelect={() => handleSelect(() => router.push(ROUTES.ACCOUNT_MEMBERS))}>
              <User className="mr-2 size-4 text-primary" />
              <span>{member.name}</span>
              <span className="ml-auto text-[9px] text-muted-foreground">{member.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
