// [職責] 點擊事件後顯示的 JSON Diff 或詳細變更對照
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/shadcn-ui/sheet";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { AuditLog } from "@/types/domain";

interface AuditDetailSheetProps {
    log: AuditLog | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuditDetailSheet({ log, isOpen, onOpenChange }: AuditDetailSheetProps) {
    if (!log) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{log.action}</SheetTitle>
                    <SheetDescription>
                        Detailed information about this audit event.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
                    <pre className="text-xs p-4 bg-muted rounded-md">
                        {JSON.stringify(log, null, 2)}
                    </pre>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
