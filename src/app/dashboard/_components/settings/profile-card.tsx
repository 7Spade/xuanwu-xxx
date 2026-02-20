"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/shadcn-ui/card";
import { Label } from "@/shared/shadcn-ui/label";
import { Input } from "@/shared/shadcn-ui/input";
import { Button } from "@/shared/shadcn-ui/button";
import { User, Loader2, Upload } from "lucide-react";
import { Textarea } from "@/shared/shadcn-ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn-ui/avatar";
import { Checkbox } from "@/shared/shadcn-ui/checkbox";
import { ExpertiseBadge, Account } from "@/types/domain"
import React from "react"

// A mock list of available expertise badges
const AVAILABLE_BADGES: ExpertiseBadge[] = [
    { id: 'react', name: 'React' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'nodejs', name: 'Node.js' },
    { id: 'python', name: 'Python' },
    { id: 'ai', name: 'GenAI' },
]

interface ProfileCardProps {
  account: Account | null
  name: string
  setName: (name: string) => void
  bio: string
  setBio: (bio: string) => void
  selectedBadges: ExpertiseBadge[]
  handleBadgeToggle: (badge: ExpertiseBadge) => void
  handleSaveProfile: () => void
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  isSaving: boolean
  isUploading: boolean
  avatarInputRef: React.RefObject<HTMLInputElement>
}

export function ProfileCard({
  account,
  name,
  setName,
  bio,
  setBio,
  selectedBadges,
  handleBadgeToggle,
  handleSaveProfile,
  handleAvatarUpload,
  isSaving,
  isUploading,
  avatarInputRef,
}: ProfileCardProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-1">
          <User className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Personal Identity</span>
        </div>
        <CardTitle className="font-headline">Profile</CardTitle>
        <CardDescription>Manage your public identity and expertise.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={account?.photoURL} />
              <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                {name?.[0]}
              </AvatarFallback>
            </Avatar>
            {isUploading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-full"><Loader2 className="animate-spin text-primary" /></div>}
          </div>
          <div className="space-y-2">
            <Button onClick={() => avatarInputRef.current?.click()} disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" /> Upload Image
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB.</p>
            <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-name">Display Name</Label>
          <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your public display name" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-bio">Bio</Label>
          <Textarea id="user-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself." className="min-h-[100px]" />
        </div>

        <div className="grid gap-2">
          <Label>Expertise</Label>
          <p className="text-sm text-muted-foreground">Select up to 5 areas of expertise to display on your profile.</p>
          <div className="flex flex-wrap gap-4 pt-2">
            {AVAILABLE_BADGES.map(badge => (
              <div key={badge.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`badge-${badge.id}`}
                  checked={selectedBadges.some(b => b.id === badge.id)}
                  onCheckedChange={() => handleBadgeToggle(badge)}
                />
                <label
                  htmlFor={`badge-${badge.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {badge.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-email">Email</Label>
          <Input id="user-email" defaultValue={account?.email} disabled />
          <p className="text-[10px] text-muted-foreground italic">Email address cannot be changed.</p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t">
        <Button onClick={handleSaveProfile} disabled={isSaving || isUploading} className="ml-auto font-bold uppercase text-xs tracking-widest">
          {isSaving || isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSaving || isUploading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
