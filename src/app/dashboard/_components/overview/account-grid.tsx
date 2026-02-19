
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card"
import { Globe, MoreVertical, Users, ArrowUpRight } from "lucide-react"
import { useApp } from "@/hooks/state/use-app"
import { Account } from "@/types/domain"

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
        className="group border-border/60 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer bg-card/60 backdrop-blur-sm"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Globe className="w-5 h-5" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:bg-accent/10" 
              onClick={(e) => { e.stopPropagation(); }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="mt-4 font-headline text-lg group-hover:text-primary transition-colors">{account.name}</CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold opacity-60">
            Sovereignty Role: {account.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{account.description || "No dimension identity description provided."}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center border-t border-border/20 mt-4 py-4">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-primary opacity-50" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              {(account.members || []).length} authorized members
            </span>
          </div>
          <div className="flex -space-x-1.5">
            {(account.members || []).slice(0, 3).map((m, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold shadow-sm">
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
        <div className="col-span-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40">
            <Globe className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No organizations have been created or joined yet.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline tracking-tight">Recent Organizations</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/account/settings')}
          className="text-xs text-primary font-bold uppercase tracking-widest hover:bg-primary/5"
        >
          Governance Center <ArrowUpRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((a) => <AccountCard key={a.id} account={a} />)}
      </div>
    </div>
  )
}
