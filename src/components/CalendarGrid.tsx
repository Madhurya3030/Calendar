import React, { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayCell } from './DayCell';
// Re-importing EventDataStore type simply from upper definition or recreating wrapper since it's just a Record

interface CalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedStart: Date | null;
  setSelectedStart: React.Dispatch<React.SetStateAction<Date | null>>;
  selectedEnd: Date | null;
  setSelectedEnd: React.Dispatch<React.SetStateAction<Date | null>>;
  eventsData: Record<string, { id: string, text: string, color: string }[]>;
  holidays: Record<string, { name: string; type: string }>;
  setIsHoveringDiwali: (val: boolean) => void;
}

export function CalendarGrid({ currentDate, onPrevMonth, onNextMonth, selectedStart, setSelectedStart, selectedEnd, setSelectedEnd, eventsData, holidays, setIsHoveringDiwali }: CalendarProps) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);


  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const onDayClick = (day: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(day);
      setSelectedEnd(null);
    } else {
      if (day < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(day);
      } else {
        setSelectedEnd(day);
      }
    }
  };

  const getEventsForDay = (day: Date) => {
    return eventsData[format(day, 'yyyy-MM-dd')] || [];
  };

  const getHoliday = (day: Date) => {
    return holidays[format(day, 'yyyy-MM-dd')] || null;
  };

  return (
    <div className="w-full bg-transparent">
      {/* Navigation Controls */}
      <div className="flex justify-end items-center mb-2 md:mb-4 px-1">
        <div className="flex gap-2 relative z-50">
          <button
            onClick={onPrevMonth}
            className="p-1 md:p-1.5 rounded bg-slate-100 hover:bg-[#2299D6] hover:text-white transition-all text-slate-400 relative z-50"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1 md:p-1.5 rounded bg-slate-100 hover:bg-[#2299D6] hover:text-white transition-all text-slate-400 relative z-50"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
          <div key={d} className={`text-center font-bold text-[9px] md:text-[10px] tracking-widest ${(d === 'SAT' || d === 'SUN') ? 'text-[#2299D6]' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Static grid, because AnimatePresence bounds are now unified at the root! */}
      <div className="grid grid-cols-7 gap-y-1 md:gap-y-2 gap-x-1 pb-4 md:pb-6" onMouseLeave={() => {
        setHoverDate(null);
        setIsHoveringDiwali(false);
      }}>
        {days.map((day, idx) => (
          <DayCell
            key={day.toString() + idx}
            day={day}
            monthStart={monthStart}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            hoverDate={hoverDate}
            events={getEventsForDay(day)}
            holiday={getHoliday(day)}   // ✅ ADD THIS
            onDayClick={onDayClick}
            onDayMouseEnter={(d) => {
              setHoverDate(d);

              const h = holidays[format(d, "yyyy-MM-dd")];

              if (h?.name.includes("Diwali")) {
                setIsHoveringDiwali(true);
              } else {
                setIsHoveringDiwali(false);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
