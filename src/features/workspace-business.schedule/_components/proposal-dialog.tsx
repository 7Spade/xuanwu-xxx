"use client";

import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn-ui/select";
import { Badge } from "@/shared/shadcn-ui/badge";
import { CalendarIcon, MapPin, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib";
import { toast } from "@/shared/utility-hooks/use-toast";
import { type Location, type SkillRequirement, type SkillTier } from "@/shared/types";
import { SKILLS } from "@/shared/constants/skills";
import { TIER_DEFINITIONS } from "@/shared-kernel/skills/skill-tier";

const MAX_SKILL_REQUIREMENT_QUANTITY = 99;

interface ProposalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    location: Location;
    requiredSkills: SkillRequirement[];
  }) => Promise<void>;
  initialDate: Date;
}

/**
 * @fileoverview ProposalDialog - A dedicated dialog component for creating schedule proposals.
 * @description This is a "dumb" component that receives its state and callbacks via props.
 * It encapsulates the entire form logic for submitting a new schedule item.
 * The requiredSkills section connects to SKILL_TAG_POOL (account-organization.skill-tag)
 * so that schedule proposals can specify staffing skill requirements.
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
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirement[]>([]);
  const [selectedSkillSlug, setSelectedSkillSlug] = useState("");
  const [selectedTier, setSelectedTier] = useState<SkillTier>("apprentice");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("1");

  useEffect(() => {
    if (isOpen) {
      setDateRange({ from: initialDate, to: initialDate });
      setTitle("");
      setDescription("");
      setLocation({ description: '' });
      setRequiredSkills([]);
      setSelectedSkillSlug("");
      setSelectedTier("apprentice");
      setSelectedQuantity("1");
    }
  }, [isOpen, initialDate]);

  const handleLocationChange = (field: keyof Location, value: string) => {
    setLocation(prev => ({
        ...prev,
        description: prev?.description || '',
        [field]: value
    }))
  };

  const handleAddSkillRequirement = () => {
    if (!selectedSkillSlug) return;
    const alreadyAdded = requiredSkills.some(r => r.tagSlug === selectedSkillSlug);
    if (alreadyAdded) {
      toast({ variant: 'destructive', title: 'Skill already added' });
      return;
    }
    const requirement: SkillRequirement = {
      tagSlug: selectedSkillSlug,
      minimumTier: selectedTier,
      quantity: Math.max(1, parseInt(selectedQuantity) || 1),
    };
    setRequiredSkills(prev => [...prev, requirement]);
    setSelectedSkillSlug("");
    setSelectedQuantity("1");
  };

  const handleRemoveSkillRequirement = (slug: string) => {
    setRequiredSkills(prev => prev.filter(r => r.tagSlug !== slug));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Title is required' });
      return;
    }
    setIsAdding(true);
    try {
      await onSubmit({ title, description, startDate: dateRange?.from, endDate: dateRange?.to, location, requiredSkills });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Schedule Proposal</DialogTitle>
          <DialogDescription>Submit a new item to the organization&apos;s timeline for approval.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4 pr-4">
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
                  <CalendarIcon className="mr-2 size-4" />
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
                    <MapPin className="size-4"/> Location
                </Label>
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        placeholder="Building"
                        value={location?.building || ''}
                        onChange={(e) => handleLocationChange('building', e.target.value)}
                        className="h-11 rounded-xl border-none bg-muted/30"
                    />
                    <Input
                        placeholder="Floor"
                        value={location?.floor || ''}
                        onChange={(e) => handleLocationChange('floor', e.target.value)}
                        className="h-11 rounded-xl border-none bg-muted/30"
                    />
                    <Input
                        placeholder="Room"
                        value={location?.room || ''}
                        onChange={(e) => handleLocationChange('room', e.target.value)}
                        className="h-11 rounded-xl border-none bg-muted/30"
                    />
                </div>
                <Textarea
                    placeholder="Location details..."
                    value={location?.description || ''}
                    onChange={(e) => handleLocationChange('description', e.target.value)}
                    className="resize-none rounded-xl border-none bg-muted/30"
                    rows={2}
                />
            </div>
          <div className="space-y-2">
            <Label>Required Skills (Optional)</Label>
            <p className="text-xs text-muted-foreground">Specify staffing requirements so the organization can match available members.</p>
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 py-1">
                {requiredSkills.map(req => {
                  const skillName = SKILLS.find(s => s.slug === req.tagSlug)?.name ?? req.tagSlug;
                  return (
                    <Badge key={req.tagSlug} variant="secondary" className="gap-1 pr-1">
                      {skillName} · {req.minimumTier} · ×{req.quantity}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillRequirement(req.tagSlug)}
                        className="ml-1 rounded-full hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select value={selectedSkillSlug} onValueChange={setSelectedSkillSlug}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select skill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILLS.map(skill => (
                      <SelectItem key={skill.slug} value={skill.slug} className="text-xs">
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as SkillTier)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_DEFINITIONS.map(def => (
                      <SelectItem key={def.tier} value={def.tier} className="text-xs">
                        {def.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={1}
                max={MAX_SKILL_REQUIREMENT_QUANTITY}
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                onBlur={(e) => {
                  const parsed = parseInt(e.target.value);
                  setSelectedQuantity(String(
                    Number.isFinite(parsed) ? Math.min(MAX_SKILL_REQUIREMENT_QUANTITY, Math.max(1, parsed)) : 1
                  ));
                }}
                className="h-9 w-16 text-xs"
              />
              <Button type="button" variant="outline" size="icon" className="size-9" onClick={handleAddSkillRequirement}>
                <Plus className="size-4" />
              </Button>
            </div>
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
