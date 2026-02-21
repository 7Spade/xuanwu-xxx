// [職責] Business — 單一 Workspace 日誌撰寫與檢視
"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { DailyLogCard } from "./daily-log-card";
import { DailyLogComposer } from "./composer";
import { useWorkspaceDailyLog } from "../_hooks/use-workspace-daily";
import { useWorkspace } from "@/features/workspace-core";

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
    <div className="mx-auto max-w-3xl space-y-8 duration-500 animate-in fade-in">
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
                `/workspaces/${workspace.id}/daily-log/${log.id}`
              )
            }
          />
        ))}
        {localLogs.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-12 text-center opacity-20">
            <MessageSquare className="size-12" />
            <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded in this space yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
