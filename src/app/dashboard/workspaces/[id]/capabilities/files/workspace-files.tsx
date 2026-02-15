
"use client";

import { useWorkspace } from "../../../../../../context/workspace-context";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
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
import { toast } from "@/hooks/ui/use-toast";
import { useFirebase } from "@/context/firebase-context";
import { collection, addDoc, updateDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useMemo, useState, useRef } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/app/_components/ui/sheet";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { formatBytes } from "@/lib/format";
import type { WorkspaceFile, WorkspaceFileVersion } from "@/types/domain";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";


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
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <ImageIcon className="w-5 h-5" />;
      case 'zip': case '7z': case 'rar': return <FileArchive className="w-5 h-5" />;
      case 'ts': case 'tsx': case 'js': return <FileCode className="w-5 h-5" />;
      case 'json': return <FileJson className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
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
        const storagePath = `workspace-files/${workspace.id}/${existingFile.id}/${versionId}/${file.name}`;
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
        const storagePath = `workspace-files/${workspace.id}/${fileId}/${versionId}/${file.name}`;
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Space File Sovereignty
        </h3>
        <Button 
            size="sm" 
            className="h-9 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg" 
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden shadow-sm">
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
                      <div className="p-2.5 bg-background rounded-xl border shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        {getFileIcon(file.name)}
                      </div>
                      <span className="text-sm font-black tracking-tight truncate">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[9px] font-black h-5 bg-primary/10 text-primary border-none">V{current?.versionNumber}</Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground uppercase">{formatBytes(current?.size || 0)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold">{current?.uploadedBy}</span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium"><Clock className="w-2.5 h-2.5" /> SYNCED</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                         <DropdownMenuItem onClick={() => window.open(current?.downloadURL, '_blank')} disabled={!current?.downloadURL} className="gap-2 text-[10px] font-bold uppercase py-2.5 cursor-pointer">
                          <Download className="w-3.5 h-3.5 text-primary" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoryFile(file)} className="gap-2 text-[10px] font-bold uppercase py-2.5 cursor-pointer">
                          <History className="w-3.5 h-3.5 text-primary" /> Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-[10px] font-bold uppercase py-2.5 text-destructive cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" /> Deregister File
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
            <div className="p-20 text-center flex flex-col items-center gap-3 opacity-20">
              <AlertCircle className="w-12 h-12" />
              <p className="text-[10px] font-black uppercase tracking-widest">No technical documents in this space</p>
            </div>
        )}
      </div>

      <Sheet open={!!historyFile} onOpenChange={(o) => !o && setHistoryFile(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0 border-l-border/40">
          <div className="p-8 border-b bg-primary/5">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <History className="w-5 h-5 text-primary" />
                <SheetTitle className="font-black text-xl">Version History</SheetTitle>
              </div>
              <SheetDescription className="font-mono text-[10px] uppercase tracking-widest">{historyFile?.name}</SheetDescription>
            </SheetHeader>
          </div>
          
          <ScrollArea className="flex-1 p-8">
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/20">
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
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black">{v.versionName}</p>
                      {historyFile.currentVersionId === v.versionId && (
                        <Badge className="text-[8px] bg-primary uppercase font-black gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase">
                      <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {v.uploadedBy}</span>
                      <span>{formatBytes(v.size)}</span>
                    </div>
                     <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/10">
                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold" onClick={() => window.open(v.downloadURL, '_blank')} disabled={!v.downloadURL}>
                            <Download className="w-3 h-3 mr-1" /> Download
                        </Button>
                        {historyFile.currentVersionId !== v.versionId && (
                          <Button variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase bg-background hover:bg-primary hover:text-white transition-all" onClick={() => handleRestore(historyFile!, v.versionId)}>
                            <RotateCcw className="w-3 h-3 mr-2" /> Restore
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
