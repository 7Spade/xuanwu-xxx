// @/app/dashboard/workspaces/[id]/capabilities/schedule/_components/proposal-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/shadcn-ui/dialog";
import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { Input } from "@/shared/shadcn-ui/input";
import { Textarea } from "@/shared/shadcn-ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/shadcn-ui/popover";
import { Calendar } from "@/shared/shadcn-ui/calendar";
import { CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils/utils";
import { toast } from "@/shared/hooks/use-toast";
import { Location } from "@/types/domain";

interface ProposalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: { title: string; description: string; startDate?: Date; endDate?: Date; location: Location; }) => Promise<void>;
  initialDate: Date;
}

/**
 * @fileoverview ProposalDialog - A dedicated dialog component for creating schedule proposals.
 * @description This is a "dumb" component that receives its state and callbacks via props.
 * It encapsulates the entire form logic for submitting a new schedule item.
 */
export function ProposalDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialDate,
}: ProposalDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [location, setLocation] = useState<Location>({ description: '' });

  useEffect(() => {
    if (isOpen) {
      setDateRange({ from: initialDate, to: initialDate });
      setTitle("");
      setDescription("");
      setLocation({ description: '' });
    }
  }, [isOpen, initialDate]);

  const handleLocationChange = (field: keyof Location, value: string) => {
    setLocation(prev => ({
        ...prev,
        description: prev?.description || '',
        [field]: value
    }))
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Title is required' });
      return;
    }
    setIsAdding(true);
    try {
      await onSubmit({ title, description, startDate: dateRange?.from, endDate: dateRange?.to, location });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Schedule Proposal</DialogTitle>
          <DialogDescription>Submit a new item to the organization's timeline for approval.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="item-title">Title</Label>
            <Input id="item-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-description">Description (Optional)</Label>
            <Textarea id="item-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn( "w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground" )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? ( dateRange.to ? ( <> {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")} </> ) : ( format(dateRange.from, "LLL dd, y") ) ) : ( <span>Pick a date</span> )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </div>
           <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4"/> Location
                </Label>
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        placeholder="Building"
                        value={location?.building || ''}
                        onChange={(e) => handleLocationChange('building', e.target.value)}
                        className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                    <Input
                        placeholder="Floor"
                        value={location?.floor || ''}
                        onChange={(e) => handleLocationChange('floor', e.target.value)}
                        className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                    <Input
                        placeholder="Room"
                        value={location?.room || ''}
                        onChange={(e) => handleLocationChange('room', e.target.value)}
                        className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                </div>
                <Textarea
                    placeholder="Location details..."
                    value={location?.description || ''}
                    onChange={(e) => handleLocationChange('description', e.target.value)}
                    className="rounded-xl bg-muted/30 border-none resize-none"
                    rows={2}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isAdding}> {isAdding ? "Adding..." : "Submit Proposal"} </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
