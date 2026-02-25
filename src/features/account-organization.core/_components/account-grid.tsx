
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/shared/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/shadcn-ui/card"
import { Globe, MoreVertical, Users, ArrowUpRight } from "lucide-react"
import { useApp } from "@/shared/app-providers/app-context"
import { type Account } from "@/shared/types"

interface AccountGridProps {
    accounts: Account[]
}

function AccountCard({ account }: { account: Account }) {
    const router = useRouter()
    const { state, dispatch } = useApp()
  
    const handleClick = () => {
      if (state.activeAccount?.id !== account.id) {
        dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: account })
      }
      router.push('/dashboard')
    }
  
    return (
      <Card 
        className="group cursor-pointer border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Globe className="size-5" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 text-muted-foreground hover:bg-accent/10" 
              onClick={(e) => { e.stopPropagation(); }}
            >
              <MoreVertical className="size-4" />
            </Button>
          </div>
          <CardTitle className="mt-4 font-headline text-lg transition-colors group-hover:text-primary">{account.name}</CardTitle>
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-60">
            Sovereignty Role: {account.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 min-h-[32px] text-xs text-muted-foreground">{account.description || "No dimension identity description provided."}</p>
        </CardContent>
        <CardFooter className="mt-4 flex items-center justify-between border-t border-border/20 py-4 pt-0">
          <div className="flex items-center gap-2">
            <Users className="size-3 text-primary opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              {(account.members || []).length} authorized members
            </span>
          </div>
          <div className="flex -space-x-1.5">
            {(account.members || []).slice(0, 3).map((m, i) => (
              <div key={i} className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-bold shadow-sm">
                {m.name?.[0]}
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  }

export function AccountGrid({ accounts }: AccountGridProps) {
  const router = useRouter();

  if (accounts.length === 0) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-8 text-center">
            <Globe className="mb-3 size-8 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground">No organizations have been created or joined yet.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold tracking-tight">Recent Organizations</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/account/settings')}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
        >
          Governance Center <ArrowUpRight className="ml-1 size-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {accounts.map((a) => <AccountCard key={a.id} account={a} />)}
      </div>
    </div>
  )
}
