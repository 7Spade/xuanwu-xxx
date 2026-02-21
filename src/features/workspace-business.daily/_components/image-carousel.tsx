"use client";

import Image from "next/image";
import { Card, CardContent } from "@/shared/shadcn-ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/shadcn-ui/carousel";

interface ImageCarouselProps {
    images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    <Carousel className="size-full">
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="p-0">
              <Card className="rounded-none border-none shadow-none">
                <CardContent className="relative flex aspect-square items-center justify-center p-0">
                  <Image src={src} alt={`Daily log image ${index + 1}`} fill className="object-cover" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-2" />
            <CarouselNext className="absolute right-2" />
          </>
      )}
    </Carousel>
  );
}
