import React from 'react';
import { format } from 'date-fns';


interface HeroSectionProps {
  currentDate: Date;
  setPickerType: React.Dispatch<React.SetStateAction<'month' | 'year' | null>>;
}

const getMonthImage = (date: Date) => {
  const month = format(date, 'M');
  const monthImages: Record<string, string> = {
    '1': '/Jan.jpg',
    '2': '/Feb.jpg',
    '3': '/March.jpg',
    '4': '/April.jpeg',
    '5': '/May.jpg',
    '6': '/June.jpg',
    '7': '/July.jpg',
    '8': '/Aug.jpg',
    '9': '/Sept1.jpg',
    '10': '/Oct.jpg',
    '11': '/Nov1.jpg',
    '12': '/Dec.jpg',
  };
  return monthImages[month] || '/Jan.jpg';
};

export function HeroSection({ currentDate, setPickerType }: HeroSectionProps) {
  const bgImage = getMonthImage(currentDate);

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
        <div className="absolute bottom-3 right-2 flex flex-col items-end z-10">

  <span 
    className="text-white text-sm md:text-lg font-medium cursor-pointer hover:opacity-80 transition-opacity"
   onClick={() => 
  setPickerType(prev => prev === 'year' ? null : 'year')
}
  >
    {format(currentDate, 'yyyy')}
  </span>

  <span 
    className="text-white text-xl md:text-2xl font-bold tracking-widest uppercase cursor-pointer hover:opacity-80 transition-opacity"
    onClick={() => 
  setPickerType(prev => prev === 'month' ? null : 'month')
}
  >
    {format(currentDate, 'MMMM')}
  </span>

</div>
      </div>

    </div>
  );
}
