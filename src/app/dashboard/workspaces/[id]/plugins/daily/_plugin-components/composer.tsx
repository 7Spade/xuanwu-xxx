// @/app/dashboard/_route-components/daily/composer.tsx
/**
 * @fileoverview Composer - The shared input component for creating daily logs.
 * @description This component encapsulates the UI and logic for the text area,
 * image previews, and submission button for daily log creation. It is designed
 * to be a controlled component, receiving its state and callbacks via props.
 *
 * @responsibility
 * - Renders the main text input area and image upload UI.
 * - Displays image previews with a removal option.
 * - Delegates form submission and file selection events to its parent.
 */
"use client";

import { Textarea } from "@/shared/shadcn-ui/textarea";
import { Button } from "@/shared/shadcn-ui/button";
import { Card } from "@/shared/shadcn-ui/card";
import { Input } from "@/shared/shadcn-ui/input";
import { ImagePlusIcon, Send, Loader2, X } from "lucide-react";
import Image from "next/image";

interface DailyLogComposerProps {
  content: string;
  setContent: (content: string) => void;
  photos: File[];
  setPhotos: (photos: File[] | ((prev: File[]) => File[])) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function DailyLogComposer({
  content,
  setContent,
  photos,
  setPhotos,
  onSubmit,
  isSubmitting,
}: DailyLogComposerProps) {

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-4 border-dashed border-2 hover:border-solid transition-all">
      <Textarea
        placeholder="What's the progress today?"
        className="resize-none border-none focus-visible:ring-0 text-base min-h-[100px]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />

      {photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2 mt-2">
              {photos.map((photo, index) => (
                  <div key={index} className="relative w-24 h-24 flex-shrink-0">
                      <Image src={URL.createObjectURL(photo)} alt={`Preview ${index}`} fill className="object-cover rounded-md" />
                       <button
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                      >
                          <X className="w-3 h-3" />
                      </button>
                  </div>
              ))}
          </div>
      )}

      <div className="flex justify-between items-center pt-2 mt-2 border-t">
        <Button asChild variant="ghost" size="icon" disabled={isSubmitting}>
          <label htmlFor="photo-upload-daily" className="cursor-pointer">
              <ImagePlusIcon />
              <Input id="photo-upload-daily" type="file" className="sr-only" multiple accept="image/*" onChange={handlePhotoSelect} />
          </label>
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting || (!content.trim() && photos.length === 0)}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {isSubmitting ? "Posting..." : "Post Update"}
        </Button>
      </div>
    </Card>
  );
}
