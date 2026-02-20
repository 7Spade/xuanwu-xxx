// [職責] Business — 單一 Workspace 日誌撰寫與檢視
"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { DailyLogCard } from "./_route-components/daily-log-card";
import { DailyLogComposer } from "./_route-components/composer";
import { useWorkspaceDailyLog } from "./_plugin-hooks/use-workspace-daily";
import { useWorkspace } from "@/react-providers/workspace-provider";

export function WorkspaceDaily() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const {
    user,
    localLogs,
    content,
    setContent,
    photos,
    setPhotos,
    isUploading,
    handlePost,
  } = useWorkspaceDailyLog();

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
            onOpen={() =>
              router.push(
                `/dashboard/workspaces/${workspace.id}/daily-log/${log.id}`
              )
            }
          />
        ))}
        {localLogs.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center gap-3 opacity-20">
            <MessageSquare className="w-12 h-12" />
            <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded in this space yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
