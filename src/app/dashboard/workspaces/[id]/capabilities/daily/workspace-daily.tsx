// @/app/dashboard/workspaces/[id]/capabilities/daily/workspace-daily.tsx
/**
 * @fileoverview WorkspaceDaily - The entry point for the daily log feature within a workspace.
 * @description This component acts as a "smart" container. It fetches data, manages state,
 * and coordinates actions between child components and backend services.
 *
 * @responsibility
 * - Holds state for new logs (content, photos).
 * - Uses `useDailyUpload` for file uploads.
 * - Uses `useLogger` to submit new logs.
 * - Renders `DailyLogComposer` for input.
 * - Renders the list of existing logs using `DailyLogCard` and provides action handlers.
 */
"use client";

import { useWorkspace } from "../../../../../../context/workspace-context";
import { MessageSquare } from "lucide-react";
import { useState, useMemo } from "react";
import { useLogger } from "@/hooks/infra/use-logger";
import { toast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { DailyLog } from "@/types/domain";
import { DailyLogCard } from "@/app/dashboard/_components/daily/daily-log-card";
import { DailyLogComposer } from "@/app/dashboard/_components/daily/composer";
import { DailyLogDialog } from "@/app/dashboard/_components/daily/daily-log-dialog";
import { useDailyUpload } from "./_hooks/use-daily-upload";
import { useAccount } from "@/hooks/state/use-account";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;


export function WorkspaceDaily() {
  const { workspace } = useWorkspace();
  const { state: accountState } = useAccount();
  const { state: authState } = useAuth();
  const { dailyLogs } = accountState;
  const { user } = authState;
  const { logDaily } = useLogger(workspace.id, workspace.name);
  const { isUploading, upload } = useDailyUpload();

  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  const localLogs = useMemo(() =>
    Object.values(dailyLogs as Record<string, DailyLog>)
        .filter(log => log.workspaceId === workspace.id)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    [dailyLogs, workspace.id]
  );

  const handlePost = async () => {
    if (!content.trim() && photos.length === 0) return;
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to post."});
        return;
    }
    
    try {
      const photoURLs = await upload(photos);
      await logDaily(content, photoURLs, user);
      
      setContent("");
      setPhotos([]);
      toast({ title: "Daily log posted successfully."});
    } catch (error: unknown) {
      console.error("Error posting daily log:", error);
      toast({
        variant: "destructive",
        title: "Post Failed",
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <DailyLogComposer
        content={content}
        setContent={setContent}
        photos={photos}
        setPhotos={setPhotos}
        onSubmit={handlePost}
        isSubmitting={isUploading}
      />

      <div className="space-y-6">
        {localLogs.map(log => (
            <DailyLogCard 
              key={log.id} 
              log={log} 
              currentUser={user}
              onOpen={() => setSelectedLog(log)}
            />
        ))}
        {localLogs.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center gap-3 opacity-20">
            <MessageSquare className="w-12 h-12" />
            <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded in this space yet.</p>
          </div>
        )}
      </div>

       <DailyLogDialog
        log={selectedLog}
        currentUser={user}
        isOpen={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLog(null);
          }
        }}
      />
    </div>
  );
}
