"use client";

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { addMonths, subMonths, format } from 'date-fns';
import { HeroSection } from './HeroSection';
import { CalendarGrid } from './CalendarGrid';
import { NotesSection } from './NotesSection';

// We upgrade our note store to support advanced multievent rendering per date string
export type CalendarEvent = { id: string; text: string; color: string; };
export type EventDataStore = Record<string, CalendarEvent[]>;
// Monthly Notes can stay simple strings mapping to "yyyy-MM" keys
export type MonthlyNotesStore = Record<string, string>;

export function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);

  const [eventsData, setEventsData] = useState<EventDataStore>({});
  const [monthlyNotes, setMonthlyNotes] = useState<MonthlyNotesStore>({});

  const [isLoaded, setIsLoaded] = useState(false);

  const mouseX = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const mouseRotate = useTransform(smoothMouseX, [0, 1], [-0.5, 0.5]);
  const [isHolding, setIsHolding] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [pickerType, setPickerType] = useState<'month' | 'year' | null>(null);
const [yearStart, setYearStart] = useState(new Date().getFullYear() - 6);

  const holidays: Record<string, { name: string; type: string }> = {
    // JANUARY
    "2026-01-01": { name: "New Year", type: "important" },
    "2026-01-14": { name: "Makar Sankranti", type: "festival" },
    "2026-01-15": { name: "Pongal", type: "festival" },
    "2026-01-26": { name: "Republic Day", type: "important" },

    // FEBRUARY
    "2026-02-14": { name: "Valentine's Day", type: "festival" },
    "2026-02-26": { name: "Maha Shivaratri", type: "festival" },

    // MARCH
    "2026-03-08": { name: "Holi", type: "festival" },
    "2026-03-29": { name: "Ugadi", type: "festival" },

    // APRIL
    "2026-04-06": { name: "Ram Navami", type: "festival" },
    "2026-04-10": { name: "Good Friday", type: "important" },
    "2026-04-14": { name: "Ambedkar Jayanti", type: "important" },

    // MAY
    "2026-05-01": { name: "Labour Day", type: "important" },

    // JUNE
    "2026-06-07": { name: "Bakrid (Eid al-Adha)", type: "festival" },

    // JULY
    "2026-07-21": { name: "Guru Purnima", type: "festival" },

    // AUGUST
    "2026-08-15": { name: "Independence Day", type: "important" },
    "2026-08-19": { name: "Raksha Bandhan", type: "festival" },
    "2026-08-27": { name: "Krishna Janmashtami", type: "festival" },

    // SEPTEMBER
    "2026-09-17": { name: "Ganesh Chaturthi", type: "festival" },
    "2026-09-07": { name: "Raaj Birthday", type: "important" },

    // OCTOBER
    "2026-10-02": { name: "Gandhi Jayanti", type: "important" },
    "2026-10-20": { name: "Diwali", type: "festival" },
    "2026-10-22": { name: "Govardhan Puja", type: "festival" },

    // NOVEMBER
    "2026-11-01": { name: "Kannada Rajyotsava", type: "festival" },
    "2026-11-15": { name: "Guru Nanak Jayanti", type: "festival" },

    // DECEMBER
    "2026-12-25": { name: "Christmas", type: "important" },
  };
  const [isHoveringDiwali, setIsHoveringDiwali] = useState(false);
  const currentMonthStr = format(currentDate, "yyyy-MM");

  const hasDiwali = Object.keys(holidays).some(
    (d) => d.startsWith(currentMonthStr) && holidays[d].name.includes("Diwali")
  );

  const hasIndependence = Object.keys(holidays).some(
    (d) => d.startsWith(currentMonthStr) && holidays[d].name.includes("Independence Day")
  );

  const hasImportant = Object.keys(holidays).some(
    (d) => d.startsWith(currentMonthStr) && holidays[d].type === "important"
  );

const handlePageClick = (e: React.MouseEvent) => {
  const target = e.target as HTMLElement;

  // Ignore real interactive elements only
 if (
  target.closest('button') ||
  target.closest('input') ||
  target.closest('textarea') ||
  target.closest('[data-no-swipe]')
)
{ 
  return;
}

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;

  const edgeZone = 80; // px

  if (x < edgeZone) {
    // LEFT EDGE → previous
    triggerSound();
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  } else if (x > rect.width - edgeZone) {
    // RIGHT EDGE → next
    triggerSound();
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  }
};

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    setTouchEndX(touchEndX);
    
    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      triggerSound();
      if (diff > 0) {
        // Left swipe (next)
        setDirection(1);
        setCurrentDate(addMonths(currentDate, 1));
      } else {
        // Right swipe (prev)
        setDirection(-1);
        setCurrentDate(subMonths(currentDate, 1));
      }
    }
  };

  const handleMouseUp = () => {
    if (holdTimeout) clearTimeout(holdTimeout);
    setIsHolding(false);
  };

const handleMonthSelect = (month: number) => {
  triggerSound();
  const newDate = new Date(currentDate);
  newDate.setMonth(month);
  setCurrentDate(newDate);
  setPickerType(null);
};

const handleYearSelect = (year: number) => {
  triggerSound();
  const newDate = new Date(currentDate);
  newDate.setFullYear(year);
  setCurrentDate(newDate);
  setPickerType(null);
};


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // Unified localStorage load mapping to the enhanced structures
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendar_events_v4');
    const storedMonthly = localStorage.getItem('calendar_monthly_v4');

    if (storedEvents) {
      try { setEventsData(JSON.parse(storedEvents)); } catch (e) { }
    }
    if (storedMonthly) {
      try { setMonthlyNotes(JSON.parse(storedMonthly)); } catch (e) { }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calendar_events_v4', JSON.stringify(eventsData));
      localStorage.setItem('calendar_monthly_v4', JSON.stringify(monthlyNotes));
    }
  }, [eventsData, monthlyNotes, isLoaded]);

  const flipAudioRef = React.useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  // If picker is NOT open → do nothing
  if (!pickerType) return;

  // If click is inside picker OR trigger → ignore
  if (
    target.closest('[data-picker]') ||
    target.closest('[data-trigger]')
  ) {
    return;
  }

  setPickerType(null);
};

  window.addEventListener('click', handleClickOutside);

  return () => window.removeEventListener('click', handleClickOutside);
}, []);

  useEffect(() => {
    // Preload a highly reliable page-turn MP3 natively to bypass click-latency network delays.
    // Using multiple known fallbacks if one fails to load
    const audio = new Audio('/flip.mpeg');
    audio.preload = "auto";
    audio.volume = 0.6;
    flipAudioRef.current = audio;
  }, []);

  const triggerSound = () => {
    try {
      if (flipAudioRef.current) {
        flipAudioRef.current.currentTime = 0; // Reset continuously for rapid clicks
        flipAudioRef.current.play().catch(e => console.warn("Audio block/delay:", e));
      }
    } catch (err) {
      console.warn("Audio Context failure", err);
    }
  };

  const handleNextMonth = () => {
    triggerSound();
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrevMonth = () => {
    triggerSound();
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };
  const dynamicShadow = useTransform(
  smoothMouseX,
  [0, 0.5, 1],
  [
    "0px 40px 80px rgba(0,0,0,0.25), -20px 0px 40px rgba(34,153,214,0.25)",
    "0px 40px 80px rgba(0,0,0,0.25), 0px 0px 40px rgba(34,153,214,0.2)",
    "0px 40px 80px rgba(0,0,0,0.25), 20px 0px 40px rgba(255,120,120,0.25)"
  ]
);

  const fullPageFlipVariants: any = {
    enter: (direction: number) => {
      if (direction > 0) {
        // Next month statically waits underneath the peeling layer
        return {
          zIndex: 0,
          opacity: 1,
        };
      } else {
        // Prev month falls DOWN over the top
        return {
          zIndex: 30,
          rotateX: 130,
          rotateY: -20,
          rotateZ: -10,
          opacity: 0,
          y: -20,
          filter: "drop-shadow(0px 40px 20px rgba(0,0,0,0.8))"
        };
      }
    },
    center: (direction: number) => {
      if (direction > 0) {
        return {
          zIndex: 10,
          opacity: 1,
          scale: 1,
          transition: { duration: 0.1 } // Waits underneath naturally
        };
      } else {
        return {
          zIndex: 30,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          opacity: 1,
          y: 0,
          filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))",
          transition: { duration: 0.8, ease: [0.25, 1.0, 0.5, 1.0] } // Soft tactical fall down 
        };
      }
    },
    exit: (direction: number) => {
      if (direction > 0) {
        return {
          zIndex: 30,

          rotateX: [0, 70, 150],
          rotateY: -20,
          rotateZ: -5,

          scaleY: [1, 0.6, 1],   // stronger curl
          scaleX: [1, 1.05, 1],  // stretch effect
          skewX: ["0deg", "-12deg", "0deg"], // twist 🔥

          y: [0, -10, -35],

          boxShadow: [
            "0px 5px 10px rgba(0,0,0,0.2)",
            "0px 120px 90px rgba(0,0,0,0.7)"
          ],

          filter: [
            "brightness(1)",
            "brightness(0.5)"
          ],

          opacity: [1, 1, 0],

          transition: {
            duration: 1.2,
            ease: [0.33, 1, 0.68, 1],
          }
        };
      }
    }
  };


  if (!isLoaded) return null;

  return (
   <div
  className="min-h-screen w-full px-3 sm:px-6 
flex items-center justify-center"
  style={{
  background: `
    linear-gradient(180deg, #f5f5f5, #e5e5e5),
    repeating-linear-gradient(
      90deg,
      rgba(0,0,0,0.02) 0px,
      rgba(0,0,0,0.02) 1px,
      transparent 1px,
      transparent 40px
    )
  `
}}
>
      {/* Outer entrance animation container WITH VERY SLOW PREMIUM physics */}
      <motion.div
        initial={{ y: -8, rotate: -2 }}

        animate={{
          y: 0,
          rotate: hasIndependence ? [0, 0.5, -0.5, 0] : 0,
          scale: hasImportant ? [1, 1.01, 1] : 1,

        }}

        transition={{
          duration: 0.5,
          repeat: 0
        }}

        style={{ transformOrigin: "top center", perspective: "2000px" }}

        className="w-full max-w-md mx-auto flex flex-col items-center 
scale-100 md:scale-95 h-full justify-start"

        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >


        {/* Wall Hook Mount */}
        <div className="flex flex-col items-center z-40 -mb-5 relative drop-shadow-xl">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-200 rounded-full border border-slate-300 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)] flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-500 rounded-full shadow-inner"></div>
          </div>
          <div className="w-16 h-4 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-xl rounded-b-sm shadow-[0_5px_10px_rgba(0,0,0,0.3)] mt-1 z-40 flex items-end justify-center pb-1">
            <div className="w-10 h-0.5 bg-slate-500/50 rounded-full shadow-inner"></div>
          </div>
        </div>

        {/* Dynamic Rotation Layer for Mouse Tilt */}
        <motion.div
          style={{ rotate: mouseRotate, transformOrigin: "top center" }}
          className="w-full origin-top"
        >
          {/* Swinging Calendar Sheet Container Base Layer */}
          <motion.div
  style={{ 
    transformOrigin: "top center", 
    perspective: "2000px",
    boxShadow: dynamicShadow
  }}
  className="relative w-full 
  rounded-b-sm rounded-t-sm flex flex-col z-20 
  border border-slate-200 bg-white"
>

            {/* Spiral binding rings statically mounted OVER the flipping paper sheets! */}
            <div className="absolute top-0 w-full h-6 -mt-2.5 flex justify-between px-10 md:px-16 z-50 pointer-events-none drop-shadow-md">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-1.5">
                  <div className="w-2 h-6 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 rounded-full shadow-[0_2px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                  <div className="w-2 h-6 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 rounded-full shadow-[0_2px_2px_rgba(0,0,0,0.3)] border border-slate-300"></div>
                </div>
              ))}
            </div>

            {/* Flipper Engine wraps the ENTIRE visual paper below the bindings */}
            <div className="relative w-full preserve-3d pointer-events-auto" style={{ height: '680px' }}>

              <AnimatePresence mode="popLayout" custom={direction}>

                <motion.div
                  key={currentDate.toString()}
                  custom={direction}
                  variants={fullPageFlipVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col bg-white overflow-hidden z-10 preserve-3d"

                  style={{ transformOrigin: "top center" }}
                >
                 <div className="relative z-20 flex flex-col h-full" >
                    <HeroSection 
  currentDate={currentDate}
  setPickerType={setPickerType}
/>
{pickerType && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">

    {/* BACKDROP */}
    <div 
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={() => setPickerType(null)}
    />

    {/* MODAL */}
    <div
      className="relative bg-white rounded-2xl shadow-xl 
      p-3 w-[75%] max-w-[260px] z-10"
      onClick={(e) => e.stopPropagation()}
    >

      {/* MONTH PICKER */}
      {pickerType === 'month' && (
        <div className="max-h-56 overflow-y-auto flex flex-col">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              onClick={() => handleMonthSelect(i)}
              className={`px-3 py-2 text-sm text-center cursor-pointer rounded-md transition
              ${
                currentDate.getMonth() === i
                  ? "bg-[#2299D6] text-white"
                  : "hover:bg-[#2299D6] hover:text-white"
              }`}
            >
              {format(new Date(2026, i, 1), 'MMMM')}
            </div>
          ))}
        </div>
      )}

      {/* YEAR PICKER */}
      {pickerType === 'year' && (
        <div className="max-h-56 overflow-y-auto flex flex-col">
          {Array.from({ length: 50 }).map((_, i) => {
            const year = new Date().getFullYear() - 25 + i;
            return (
              <div
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`px-3 py-2 text-sm text-center cursor-pointer rounded-md transition
                ${
                  currentDate.getFullYear() === year
                    ? "bg-[#2299D6] text-white"
                    : "hover:bg-[#2299D6] hover:text-white"
                }`}
              >
                {year}
              </div>
            );
          })}
        </div>
      )}

    </div>
  </div>
)}

                   <div className="flex flex-row flex-1 p-2 md:p-4 bg-white gap-2"> 
                      {/* Notes section on the left */}
                      <div className="w-1/3 border-r border-slate-100 pr-2 md:pr-4">
                        <NotesSection
                          currentDate={currentDate}
                          selectedStart={selectedStart}
                          selectedEnd={selectedEnd}
                          monthlyNotes={monthlyNotes}
                          setMonthlyNotes={setMonthlyNotes}
                          eventsData={eventsData}
                          setEventsData={setEventsData}
                        />
                      </div>

                      {/* Calendar grid on the right */}
                    <div className="w-2/3 pl-2 md:pl-4">
  <div className="p-3 bg-white rounded-xl shadow-sm">
                        <CalendarGrid
                          currentDate={currentDate}
                          onPrevMonth={handlePrevMonth}
                          onNextMonth={handleNextMonth}
                          selectedStart={selectedStart}
                          setSelectedStart={setSelectedStart}
                          selectedEnd={selectedEnd}
                          setSelectedEnd={setSelectedEnd}
                          eventsData={eventsData}
                          holidays={holidays}
                          setIsHoveringDiwali={setIsHoveringDiwali}
                        />
                        </div>
                      </div>
                    </div>
                  </div>
                 <motion.div
  style={{ opacity: smoothMouseX }}
  className="absolute -bottom-8 left-1/2 -translate-x-1/2 
  w-[70%] h-10 rounded-full pointer-events-none
  bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-2xl"
/>
                </motion.div>
              </AnimatePresence>
            </div>

          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
