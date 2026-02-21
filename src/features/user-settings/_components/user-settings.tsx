
"use client";

import { toast } from "@/shared/utility-hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { useI18n } from "@/shared/app-providers/i18n-provider";
import { useUser } from "@/features/user-settings";
import { ExpertiseBadge } from "@/shared/types";

import { ProfileCard } from "./profile-card";
import { PreferencesCard } from "./preferences-card";
import { SecurityCard } from "./security-card";

/**
 * UserSettings - The main "smart" component for all user settings.
 * Responsibility: Manages all state and business logic for the user settings
 * section, and delegates rendering to "dumb" card components.
 */
export function UserSettings() {
  const router = useRouter();
  const { t } = useI18n();
  const { state: authState, dispatch: authDispatch, logout } = useAuth();
  const { user } = authState;
  const { profile, updateProfile, uploadAvatar, loading: profileLoading } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<ExpertiseBadge[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (user) setName(user.name);
    if (profile) {
      setBio(profile.bio || "");
      setSelectedBadges(profile.expertiseBadges || []);
    }
  }, [user, profile]);

  if (!isMounted || !user) {
      // You can return a loading skeleton here
      return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (user?.name !== name) {
        authDispatch({ type: 'UPDATE_USER_PROFILE', payload: { name } });
      }
      await updateProfile({ bio, expertiseBadges: selectedBadges });
      toast({
        title: "Profile Updated",
        description: "Your personal information has been successfully saved.",
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = () => {
    if (confirm(t('settings.confirmWithdrawal'))) {
      logout();
      router.push("/login");
      toast({
        variant: "destructive",
        title: t('settings.identityDeregistered'),
        description: t('settings.identityDeregisteredDescription'),
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast({ title: "Avatar updated successfully" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: e.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBadgeToggle = (badge: ExpertiseBadge) => {
    setSelectedBadges(prev => {
      const isSelected = prev.some(b => b.id === badge.id);
      if (isSelected) {
        return prev.filter(b => b.id !== badge.id);
      } else {
        return [...prev, badge];
      }
    });
  };

  return (
      <div className="grid gap-6">
        <ProfileCard
          account={profile ?? user}
          name={name}
          setName={setName}
          bio={bio}
          setBio={setBio}
          selectedBadges={selectedBadges}
          handleBadgeToggle={handleBadgeToggle}
          handleSaveProfile={handleSaveProfile}
          handleAvatarUpload={handleAvatarUpload}
          isSaving={isSaving || profileLoading}
          isUploading={isUploading}
          avatarInputRef={avatarInputRef}
        />
        <PreferencesCard />
        <SecurityCard onWithdraw={handleWithdraw} t={t} />
      </div>
  );
}
