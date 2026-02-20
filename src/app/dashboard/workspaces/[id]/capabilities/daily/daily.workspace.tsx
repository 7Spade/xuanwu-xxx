// [職責] Business — 單一 Workspace 日誌撰寫與檢視
"use client";

import { MessageSquare } from "lucide-react";
import { DailyLogCard } from "./_components/daily-log-card";
import { DailyLogComposer } from "./_components/composer";
import { DailyLogDialog } from "./_components/daily-log-dialog";
import { useWorkspaceDailyLog } from "./_hooks/use-workspace-daily";

export function WorkspaceDaily() {
  const {
    user,
    localLogs,
    content,
    setContent,
    photos,
    setPhotos,
    isUploading,
    selectedLog,
    setSelectedLog,
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
        onOpenChange={(open) => { if (!open) setSelectedLog(null); }}
      />
    </div>
  );
}
