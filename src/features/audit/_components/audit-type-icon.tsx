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
            return <Zap className="w-3.5 h-3.5" />;
        case 'delete':
            return <Shield className="w-3.5 h-3.5" />;
        case 'security':
            return <Terminal className="w-3.5 h-3.5" />;
        case 'update':
        default:
            return <Activity className="w-3.5 h-3.5" />;
    }
}
