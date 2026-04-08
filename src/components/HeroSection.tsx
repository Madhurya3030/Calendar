import React from 'react';
import { format } from 'date-fns';
const bgImage = "/BG_IMG.jpeg";

interface HeroSectionProps {
  currentDate: Date;
}

export function HeroSection({ currentDate }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden flex-shrink-0 bg-slate-200">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Blue Geometric Overlay at the bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-24 md:h-32 block">
          {/* A polygon that points up and to the left/right like in the reference */}
          <polygon points="0,200 1000,200 1000,0 500,200 0,120" className="fill-[#2299D6]" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-24 md:h-32 block">
          <polygon points="0,200 1000,200 1000,0 500,200 0,120" className="fill-[#2299D6]" />
        </svg>

        {/* TEXT ON BLUE AREA */}
        <div className="absolute bottom-3 right-2 md:bottom-4 md:right-4 flex flex-col items-end z-10">
          <span className="text-white text-sm md:text-lg font-medium">
            {format(currentDate, 'yyyy')}
          </span>
          <span className="text-white text-xl md:text-2xl font-bold tracking-widest uppercase">
            {format(currentDate, 'MMMM')}
          </span>
        </div>
      </div>

    </div>
  );
}
