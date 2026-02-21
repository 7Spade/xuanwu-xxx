
"use client";

import { useWorkspace } from '@/features/workspace-core';
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { 
  FileText, 
  UploadCloud, 
  Clock, 
  History, 
  RotateCcw, 
  Trash2, 
  MoreVertical,
  ImageIcon,
  FileArchive,
  FileCode,
  FileJson,
  User,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2
} from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import { useFirebase } from "@/shared/app-providers/firebase-provider";
import { collection, addDoc, updateDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useMemo, useState, useRef } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/shared/shadcn-ui/sheet";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu";
import { cn } from "@/shared/utils/utils";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { formatBytes } from "@/shared/utils/format-bytes";
import type { WorkspaceFile, WorkspaceFileVersion } from "@/shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/shadcn-ui/table";


const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * WorkspaceFiles - High-sensory file version governance center.
 * Features: Smart type detection, version history visualization, and instant sovereignty restoration.
 */
export function WorkspaceFiles() {
  const { workspace, logAuditEvent } = useWorkspace();
  const { state: { user } } = useAuth();
  const { db, storage } = useFirebase();
  
  const [historyFile, setHistoryFile] = useState<WorkspaceFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = useMemo(() => Object.values(workspace.files || {}).sort((a,b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0)), [workspace.files]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <ImageIcon className="size-5" />;
      case 'zip': case '7z': case 'rar': return <FileArchive className="size-5" />;
      case 'ts': case 'tsx': case 'js': return <FileCode className="size-5" />;
      case 'json': return <FileJson className="size-5" />;
      default: return <FileText className="size-5" />;
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
      const existingFile = files.find(f => f.name === file.name);

      if (existingFile) {
        // --- Versioning Logic ---
        const nextVer = (existingFile.versions?.length || 0) + 1;
        const versionId = Math.random().toString(36).slice(-6);
        const storagePath = `files-plugin/${workspace.id}/${existingFile.id}/${versionId}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const newVersion: WorkspaceFileVersion = {
          versionId: versionId,
          versionNumber: nextVer,
          versionName: `Revision #${nextVer}`,
          size: file.size,
          uploadedBy: user.name,
          createdAt: new Date(),
          downloadURL: downloadURL
        };

        const fileRef = doc(db, "workspaces", workspace.id, "files", existingFile.id);
        await updateDoc(fileRef, {
          versions: arrayUnion(newVersion),
          currentVersionId: versionId,
          updatedAt: serverTimestamp()
        });
        
        logAuditEvent("File Version Iterated", `${file.name} (v${nextVer})`, 'update');
        toast({ title: "Version Iterated", description: `${file.name} has been upgraded to v${nextVer}.` });

      } else {
        // --- New File Logic ---
        const fileId = Math.random().toString(36).slice(2, 11);
        const versionId = Math.random().toString(36).slice(-6);
        const storagePath = `files-plugin/${workspace.id}/${fileId}/${versionId}/${file.name}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const newFileData: Omit<WorkspaceFile, 'id'> = {
          name: file.name,
          type: file.type,
          currentVersionId: versionId,
          updatedAt: serverTimestamp(),
          versions: [{
            versionId: versionId,
            versionNumber: 1,
            versionName: "Initial Specification",
            size: file.size,
            uploadedBy: user.name,
            createdAt: new Date(),
            downloadURL: downloadURL
          }]
        };

        await addDoc(collection(db, "workspaces", workspace.id, "files"), newFileData);
        logAuditEvent("Mounted New Document", file.name, 'create');
        toast({ title: "Document Uploaded", description: `${file.name} has been mounted to the space.` });
      }
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Failed to Upload File",
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRestore = async (file: WorkspaceFile, versionId: string) => {
    const fileRef = doc(db, "workspaces", workspace.id, "files", file.id);
    const updates = { 
      currentVersionId: versionId, 
      updatedAt: serverTimestamp() 
    };
    try {
      await updateDoc(fileRef, updates);
      logAuditEvent("Restored File State", `${file.name} to a previous version`, 'update');
      toast({ title: "Version Restored", description: "File sovereignty has been restored to the specified point in time." });
      setHistoryFile(null);
    } catch(error: unknown) {
        console.error("Error restoring version:", error);
        toast({
          variant: "destructive",
          title: "Failed to Restore Version",
          description: getErrorMessage(error, "An unknown error occurred."),
        });
    }
  };

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <FileText className="size-3.5" /> Space File Sovereignty
        </h3>
        <Button 
            size="sm" 
            className="h-9 gap-2 rounded-full text-[10px] font-black uppercase shadow-lg" 
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-sm backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50%]">File</TableHead>
              <TableHead className="text-center">Version</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files?.map(file => {
              const current = file.versions?.find((v) => v.versionId === file.currentVersionId) || file.versions?.[0];
              return (
                <TableRow key={file.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl border bg-background p-2.5 text-primary shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                        {getFileIcon(file.name)}
                      </div>
                      <span className="truncate text-sm font-black tracking-tight">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="h-5 border-none bg-primary/10 text-[9px] font-black text-primary">V{current?.versionNumber}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] uppercase text-muted-foreground">{formatBytes(current?.size || 0)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold">{current?.uploadedBy}</span>
                      <span className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground"><Clock className="size-2.5" /> SYNCED</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/5"><MoreVertical className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                         <DropdownMenuItem onClick={() => window.open(current?.downloadURL, '_blank')} disabled={!current?.downloadURL} className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase">
                          <Download className="size-3.5 text-primary" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoryFile(file)} className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase">
                          <History className="size-3.5 text-primary" /> Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase text-destructive">
                          <Trash2 className="size-3.5" /> Deregister File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {(!files || files.length === 0) && (
            <div className="flex flex-col items-center gap-3 p-20 text-center opacity-20">
              <AlertCircle className="size-12" />
              <p className="text-[10px] font-black uppercase tracking-widest">No technical documents in this space</p>
            </div>
        )}
      </div>

      <Sheet open={!!historyFile} onOpenChange={(o) => !o && setHistoryFile(null)}>
        <SheetContent className="flex flex-col border-l-border/40 p-0 sm:max-w-md">
          <div className="border-b bg-primary/5 p-8">
            <SheetHeader>
              <div className="mb-2 flex items-center gap-3">
                <History className="size-5 text-primary" />
                <SheetTitle className="text-xl font-black">Version History</SheetTitle>
              </div>
              <SheetDescription className="font-mono text-[10px] uppercase tracking-widest">{historyFile?.name}</SheetDescription>
            </SheetHeader>
          </div>
          
          <ScrollArea className="flex-1 p-8">
            <div className="relative space-y-8 pl-8 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-primary/20">
              {historyFile?.versions?.slice().reverse().map((v: WorkspaceFileVersion) => (
                <div key={v.versionId} className="relative">
                  <div className={cn(
                    "absolute -left-10 top-1 w-5 h-5 rounded-full border-4 border-background ring-2 transition-all",
                    historyFile.currentVersionId === v.versionId ? "bg-primary ring-primary/20 scale-125 shadow-lg shadow-primary/30" : "bg-muted ring-muted/20"
                  )} />
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all", 
                    historyFile.currentVersionId === v.versionId ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-muted/30 border-border/60"
                  )}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-black">{v.versionName}</p>
                      {historyFile.currentVersionId === v.versionId && (
                        <Badge className="gap-1 bg-primary text-[8px] font-black uppercase">
                          <CheckCircle2 className="size-2.5" /> Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="size-2.5" /> {v.uploadedBy}</span>
                      <span>{formatBytes(v.size)}</span>
                    </div>
                     <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/10 pt-3">
                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold" onClick={() => window.open(v.downloadURL, '_blank')} disabled={!v.downloadURL}>
                            <Download className="mr-1 size-3" /> Download
                        </Button>
                        {historyFile.currentVersionId !== v.versionId && (
                          <Button variant="outline" size="sm" className="h-7 bg-background text-[9px] font-black uppercase transition-all hover:bg-primary hover:text-white" onClick={() => handleRestore(historyFile!, v.versionId)}>
                            <RotateCcw className="mr-2 size-3" /> Restore
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
