// [職責] 根據事件類型顯示對應 Icon (Zap, Shield, etc.)
"use client";

import { Zap, Shield, Activity, Terminal } from "lucide-react";
import { type AuditLog } from "@/shared/types";

interface AuditTypeIconProps {
    type: AuditLog['type'];
}

export function AuditTypeIcon({ type }: AuditTypeIconProps) {
    switch (type) {
        case 'create':
            return <Zap className="size-3.5" />;
        case 'delete':
            return <Shield className="size-3.5" />;
        case 'security':
            return <Terminal className="size-3.5" />;
        case 'update':
        default:
            return <Activity className="size-3.5" />;
    }
}
