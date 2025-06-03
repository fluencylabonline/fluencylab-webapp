"use client";

import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  addWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FiCalendar } from "react-icons/fi";

interface Student {
  id: string;
  name: string;
  email: string;
  diaAula?: string[];
  horario?: string[];
}

interface StudentCalendarViewProps {
  students: Student[];
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

const DAYS_OF_WEEK_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const getDayIndexFromName = (dayName: string): number | null => {
  const index = DAYS_OF_WEEK_NAMES.indexOf(dayName);
  return index !== -1 ? index : null;
};

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

const messages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Inteiro",
  week: "Semana",
  work_week: "Semana de Trabalho",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há eventos neste período.",
  showMore: (total: number) => `+ Ver mais (${total})`,
};

// Create a mapping object for view labels
const viewLabels: Record<View, string> = {
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  work_week: "Semana de Trabalho",
};

const StudentCalendarView: React.FC<StudentCalendarViewProps> = ({
  students,
}) => {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const events: CalendarEvent[] = useMemo(() => {
    const generatedEvents: CalendarEvent[] = [];
    const lookaheadWeeks = 52 * 2;

    let generationStartDate = startOfWeek(
      new Date(new Date().getFullYear(), 0, 1),
      { locale: ptBR }
    );

    students.forEach((student) => {
      if (
        student.diaAula &&
        Array.isArray(student.diaAula) &&
        student.horario &&
        Array.isArray(student.horario) &&
        student.diaAula.length > 0 &&
        student.diaAula.length === student.horario.length
      ) {
        student.diaAula.forEach((dayName, index) => {
          const classDayOfWeekIndex = getDayIndexFromName(dayName);
          if (classDayOfWeekIndex === null) return;

          const classTime = student.horario![index];
          const [hours, minutes] = classTime.split(":").map(Number);

          for (let i = 0; i < lookaheadWeeks; i++) {
            let targetDate = addWeeks(generationStartDate, i);
            const currentDayOfTargetDate = getDay(targetDate);
            if (currentDayOfTargetDate !== classDayOfWeekIndex) {
              targetDate = new Date(
                targetDate.setDate(
                  targetDate.getDate() +
                    ((classDayOfWeekIndex + 7 - currentDayOfTargetDate) % 7)
                )
              );
            }

            const startTime = new Date(targetDate);
            startTime.setHours(hours, minutes, 0, 0);
            const endTime = addMinutes(startTime, 60);

            generatedEvents.push({
              title: student.name,
              start: startTime,
              end: endTime,
              resource: student.id,
            });
          }
        });
      }
    });

    return generatedEvents;
  }, [students]);

  return (
    <div className="flex flex-col bg-fluency-pages-light dark:bg-fluency-gray-900 p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-fluency-text-light dark:text-fluency-text-dark flex items-center">
          <FiCalendar className="mr-2 text-fluency-blue-500 dark:text-fluency-blue-400" />
          Calendário de Aulas
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.values(Views).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                currentView === view
                  ? "bg-fluency-blue-500 text-white"
                  : "bg-fluency-gray-100 dark:bg-fluency-gray-800 text-fluency-text-light dark:text-fluency-text-dark"
              }`}
            >
              {/* Use the viewLabels mapping to get the string */}
              {viewLabels[view]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-fluency-gray-50 dark:bg-fluency-gray-800 rounded-xl overflow-hidden shadow-inner h-[60vh] min-h-[400px] transition-all duration-300">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onView={setCurrentView}
          messages={messages}
          culture="pt-BR"
          components={{
            event: ({ event }) => (
              <div className="rbc-event-content p-1">
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-xs opacity-80">
                  {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                </div>
              </div>
            ),
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: "var(--event-bg-color)",
              borderColor: "var(--event-border-color)",
              borderRadius: "8px",
              color: "var(--event-text-color)",
              border: "none",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              padding: "0 4px",
              fontSize: "0.85rem",
            },
          })}
          className="[--event-bg-color:#4a9eff] dark:[--event-bg-color:#3a7bd5] [--event-text-color:#ffffff] [--event-border-color:#3a7bd5] dark:[--event-border-color:#2a5b9d]"
        />
      </div>
      
      <style jsx global>{`
        /* Calendar container */
        .rbc-calendar {
          background: transparent;
          border-radius: 0.75rem;
          padding: 0.5rem;
          color: var(--fluency-text-light);
        }
        
        .dark .rbc-calendar {
          color: var(--fluency-text-dark);
        }
        
        /* Toolbar */
        .rbc-toolbar {
          padding: 0.75rem 1rem;
          background: var(--fluency-gray-100);
          border-radius: 0.75rem 0.75rem 0 0;
          border: none;
          margin-bottom: 0;
        }
        
        .dark .rbc-toolbar {
          background: var(--fluency-gray-800);
        }
        
        .rbc-btn-group button {
          background: var(--fluency-gray-200);
          border: none;
          color: var(--fluency-text-light);
          border-radius: 0.5rem;
          padding: 0.375rem 0.75rem;
          margin: 0 0.125rem;
          transition: all 0.2s;
        }
        
        .dark .rbc-btn-group button {
          background: var(--fluency-gray-700);
          color: var(--fluency-text-dark);
        }
        
        .rbc-btn-group button:hover,
        .rbc-btn-group button:focus,
        .rbc-btn-group button.rbc-active {
          background: var(--fluency-blue-500);
          color: white;
          box-shadow: none;
        }
        
        .rbc-toolbar-label {
          font-weight: 600;
          color: var(--fluency-text-light);
        }
        
        .dark .rbc-toolbar-label {
          color: var(--fluency-text-dark);
        }
        
        /* Header */
        .rbc-header {
          padding: 0.5rem;
          background: var(--fluency-gray-100);
          color: var(--fluency-text-light);
          border-left: none;
          border-right: none;
          border-top: none;
          border-bottom: 1px solid var(--fluency-gray-200);
          font-weight: 500;
        }
        
        .dark .rbc-header {
          background: var(--fluency-gray-800);
          color: var(--fluency-text-dark);
          border-bottom: 1px solid var(--fluency-gray-700);
        }
        
        /* Time slots */
        .rbc-time-slot {
          color: var(--fluency-text-light);
          border-bottom: 1px solid var(--fluency-gray-200);
        }
        
        .dark .rbc-time-slot {
          color: var(--fluency-text-dark);
          border-bottom: 1px solid var(--fluency-gray-700);
        }
        
        /* Cells */
        .rbc-day-bg {
          background: var(--fluency-gray-50);
          border: 1px solid var(--fluency-gray-200);
        }
        
        .dark .rbc-day-bg {
          background: var(--fluency-gray-800);
          border: 1px solid var(--fluency-gray-700);
        }
        
        .rbc-off-range-bg {
          background: var(--fluency-gray-100);
          opacity: 0.5;
        }
        
        .dark .rbc-off-range-bg {
          background: var(--fluency-gray-900);
        }
        
        .rbc-today {
          background: rgba(74, 158, 255, 0.1);
        }
        
        .dark .rbc-today {
          background: rgba(58, 123, 213, 0.15);
        }
        
        /* Agenda view */
        .rbc-agenda-view table.rbc-agenda-table {
          border: 1px solid var(--fluency-gray-200);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .dark .rbc-agenda-view table.rbc-agenda-table {
          border: 1px solid var(--fluency-gray-700);
        }
        
        .rbc-agenda-time-cell {
          background: var(--fluency-gray-100);
          color: var(--fluency-text-light);
        }
        
        .dark .rbc-agenda-time-cell {
          background: var(--fluency-gray-800);
          color: var(--fluency-text-dark);
        }
        
        .rbc-agenda-date-cell {
          font-weight: 500;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .rbc-toolbar {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .rbc-btn-group {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem;
          }
          
          .rbc-btn-group button {
            width: 100%;
            margin: 0;
          }
          
          .rbc-toolbar-label {
            order: -1;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentCalendarView;