import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
  id: string;
  text: string;
  color: string;
}

interface NotesSectionProps {
  currentDate: Date;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  monthlyNotes: Record<string, string>;
  setMonthlyNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  eventsData: Record<string, CalendarEvent[]>;
  setEventsData: React.Dispatch<React.SetStateAction<Record<string, CalendarEvent[]>>>;
}

const PALETTE = ['bg-pink-400', 'bg-[#2299D6]', 'bg-purple-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-500'];

export function NotesSection({ currentDate, selectedStart, selectedEnd, monthlyNotes, setMonthlyNotes, eventsData, setEventsData }: NotesSectionProps) {
  const monthKey = format(currentDate, 'yyyy-MM');
  const [monthlyNote, setMonthlyNoteLocal] = useState('');

  const selectedRangeKey = selectedStart
    ? selectedEnd
      ? `${format(selectedStart < selectedEnd ? selectedStart : selectedEnd, 'yyyy-MM-dd')}_${format(selectedStart > selectedEnd ? selectedStart : selectedEnd, 'yyyy-MM-dd')}`
      : format(selectedStart, 'yyyy-MM-dd')
    : '';

  const [dateNote, setDateNoteLocal] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastDate =
    selectedStart &&
    new Date(selectedStart).setHours(0, 0, 0, 0) < today.getTime();

  useEffect(() => {
    setMonthlyNoteLocal(monthlyNotes[monthKey] || '');
  }, [monthKey, monthlyNotes]);

  useEffect(() => {
    if (!selectedStart) {
      setDateNoteLocal('');
      return;
    }

    const dayStr = format(selectedStart < (selectedEnd || selectedStart) ? selectedStart : (selectedEnd || selectedStart), 'yyyy-MM-dd');
    const events = eventsData[dayStr] || [];
    const prefix = `note-${selectedRangeKey}-`;

    // We only show notes that were created under this exact selection (single day vs specific range)
    // This prevents duplication of range notes when editing a single day enclosed in that range.
    const relevantEvents = events.filter(e => e.id.startsWith(prefix));
    setDateNoteLocal(relevantEvents.map(e => e.text).join("\n"));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStart, selectedEnd, selectedRangeKey]);

  const handleMonthlyNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMonthlyNoteLocal(val);
    setMonthlyNotes(prev => ({ ...prev, [monthKey]: val }));
  };

  const handleDateNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isPastDate) return;
    const val = e.target.value;
    setDateNoteLocal(val);

    if (selectedStart) {
      const start = selectedEnd && selectedEnd < selectedStart ? selectedEnd : selectedStart;
      const end = selectedEnd && selectedEnd > selectedStart ? selectedEnd : selectedStart;

      const days = selectedEnd ? eachDayOfInterval({ start, end }) : [selectedStart];
      const prefix = `note-${selectedRangeKey}-`;
      const lines = val.split('\n').filter(l => l.trim() !== '');

      setEventsData(prev => {
        const newData = { ...prev };

        days.forEach(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          let dayEvents = (newData[dayStr] || []);

          // Remove previous events generated for this specific selection
          dayEvents = dayEvents.filter(ev => !ev.id.startsWith(prefix));

          if (lines.length > 0) {
            const evs = lines.map((line, i) => ({
              id: `${prefix}${i}`,
              text: line, // Do not trim to preserve user spacing during typing
              color: PALETTE[i % PALETTE.length]
            }));
            dayEvents = [...dayEvents, ...evs];
          }

          if (dayEvents.length === 0) {
            delete newData[dayStr];
          } else {
            newData[dayStr] = dayEvents;
          }
        });

        return newData;
      });
    }
  };

  const lineStyle = {
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #e2e8f0 23px, #e2e8f0 24px)',
    lineHeight: '24px',
    backgroundAttachment: 'local'
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative">
      <h4 className="text-[11px] font-bold text-slate-800 mb-1 px-1">
        Notes
      </h4>

      <div className="flex-1 flex flex-col relative w-full h-full">
        <textarea
          style={lineStyle}
          value={monthlyNote}
          onChange={handleMonthlyNoteChange}
          // ✅ ADD
          className={`w-full flex-1 resize-none bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400 border-none px-1 ${isPastDate ? 'opacity-60 cursor-not-allowed' : ''
            }`}
        />
        <div className="flex items-center gap-2 mt-2 mb-1 px-1 min-h-[14px]">
          <h4 className="text-[9px] font-bold text-[#2299D6] uppercase tracking-widest leading-none drop-shadow-sm">
            {selectedStart ? (
              selectedEnd && selectedStart.getTime() !== selectedEnd.getTime()
                ? `${format(selectedStart < selectedEnd ? selectedStart : selectedEnd, 'MMM d')} - ${format(selectedStart > selectedEnd ? selectedStart : selectedEnd, 'MMM d')}`
                : `${format(selectedStart, 'MMMM d, yyyy')}`
            ) : (
              'Select Date'
            )}
          </h4>
        </div>

        <AnimatePresence mode="wait">
          {selectedStart ? (
            <motion.textarea
              key={selectedRangeKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={lineStyle}
              value={dateNote}
              onChange={handleDateNoteChange}
              // ✅ ADD THIS
              placeholder={
                isPastDate
                  ? "Past date (read-only)"
                  : selectedEnd
                    ? "Range notes (applied to all days)..."
                    : "Specific notes..."
              }
              className={`w-full flex-1 resize-none bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400 border-none px-1 ${isPastDate ? 'opacity-60 cursor-not-allowed' : ''
                }`}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex-1 bg-transparent flex flex-col items-center justify-center text-slate-400 text-[10px]"
            >
              <p className="opacity-0">Click date for events.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
