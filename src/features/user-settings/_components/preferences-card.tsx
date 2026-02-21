"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { Label } from "@/shared/shadcn-ui/label";
import { Separator } from "@/shared/shadcn-ui/separator";
import { Switch } from "@/shared/shadcn-ui/switch";
import { Bell } from "lucide-react";

export function PreferencesCard() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2 text-primary">
          <Bell className="size-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Environment Preferences</span>
        </div>
        <CardTitle className="font-headline">Sovereignty Environment Settings</CardTitle>
        <CardDescription>Control automated behaviors when switching between different logical spaces.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Auto-adapt UI Resonance</Label>
            <p className="text-sm text-muted-foreground">Automatically invoke AI to generate unique colors when entering different organization dimensions.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Dimension Activity Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive alerts for new technical spec mounts or member changes in logical spaces.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}
