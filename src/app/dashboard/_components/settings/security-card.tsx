"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SecurityCardProps {
  onWithdraw: () => void;
  t: (key: string) => string;
}

export function SecurityCard({ onWithdraw, t }: SecurityCardProps) {
  return (
    <Card className="border-destructive/30 border-2 bg-destructive/5 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ultimate Security</span>
        </div>
        <CardTitle className="font-headline text-destructive">{t('settings.identityWithdrawal')}</CardTitle>
        <CardDescription className="text-destructive/80">{t('settings.withdrawalDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs font-medium text-destructive mb-4">{t('settings.confirmWithdrawal')}</p>
        <Button variant="destructive" className="font-bold uppercase tracking-widest text-xs" onClick={onWithdraw}>{t('settings.withdraw')}</Button>
      </CardContent>
    </Card>
  );
}
