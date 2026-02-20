"use client";

import Image from "next/image";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/_components/ui/carousel";

interface ImageCarouselProps {
    images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    <Carousel className="w-full h-full">
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="p-0">
              <Card className="border-none rounded-none shadow-none">
                <CardContent className="flex aspect-square items-center justify-center p-0 relative">
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
