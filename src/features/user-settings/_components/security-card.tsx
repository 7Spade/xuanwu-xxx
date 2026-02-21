"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { Button } from "@/shared/shadcn-ui/button";
import { AlertTriangle } from "lucide-react";

interface SecurityCardProps {
  onWithdraw: () => void;
  t: (key: string) => string;
}

export function SecurityCard({ onWithdraw, t }: SecurityCardProps) {
  return (
    <Card className="border-2 border-destructive/30 bg-destructive/5 shadow-sm">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ultimate Security</span>
        </div>
        <CardTitle className="font-headline text-destructive">{t('settings.identityWithdrawal')}</CardTitle>
        <CardDescription className="text-destructive/80">{t('settings.withdrawalDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs font-medium text-destructive">{t('settings.confirmWithdrawal')}</p>
        <Button variant="destructive" className="text-xs font-bold uppercase tracking-widest" onClick={onWithdraw}>{t('settings.withdraw')}</Button>
      </CardContent>
    </Card>
  );
}
