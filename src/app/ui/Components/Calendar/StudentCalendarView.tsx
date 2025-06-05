"use client";

import React, { useMemo, useState, CSSProperties } from "react";
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
import { FiCalendar, FiX } from "react-icons/fi";
import { TimeSlot, RescheduledClass } from "@/app/types";

interface Student {
  id: string;
  name: string;
  email: string;
  diaAula?: string[];
  horario?: string[];
}

interface StudentCalendarViewProps {
  students: Student[];
  availableSlots?: TimeSlot[];
  rescheduledClasses?: RescheduledClass[];
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  type?: "student" | "available" | "rescheduled";
  status?: string;
  studentId?: string;
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

const EventDetailsModal: React.FC<{
  event: CalendarEvent | null;
  onClose: () => void;
}> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-fluency-pages-light dark:bg-fluency-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500"
        >
          <FiX size={24} />
        </button>
        
        <h3 className="text-xl font-bold mb-4 text-fluency-text-light dark:text-fluency-text-dark">
          Detalhes do Evento
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">Título</p>
            <p className="font-medium">{event.title}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">Início</p>
              <p className="font-medium">{format(event.start, "dd/MM/yyyy HH:mm")}</p>
            </div>
            <div>
              <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">Término</p>
              <p className="font-medium">{format(event.end, "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">Tipo</p>
            <p className="font-medium">
              {event.type === "student" 
                ? "Aula Regular" 
                : event.type === "available" 
                  ? "Horário Disponível" 
                  : "Aula Remarcada"}
            </p>
          </div>
          
          {event.type === "rescheduled" && (
            <div>
              <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">Status</p>
              <p className="font-medium">Confirmada</p>
            </div>
          )}
          
          {event.studentId && (
            <div>
              <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">ID do Aluno</p>
              <p className="font-medium">{event.studentId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentCalendarView: React.FC<StudentCalendarViewProps> = ({
  students,
  availableSlots = [],
  rescheduledClasses = [],
}) => {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events: CalendarEvent[] = useMemo(() => {
    const generatedEvents: CalendarEvent[] = [];
    const lookaheadWeeks = 52 * 2;

    let generationStartDate = startOfWeek(
      new Date(new Date().getFullYear(), 0, 1),
      { locale: ptBR }
    );

    // Student classes
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
              type: "student",
              studentId: student.id,
            });
          }
        });
      }
    });

    // Available slots
    availableSlots.forEach((slot) => {
      if (slot.isRecurring && slot.dayOfWeek !== undefined) {
        for (let i = 0; i < lookaheadWeeks; i++) {
          let targetDate = addWeeks(generationStartDate, i);
          const currentDayOfTargetDate = getDay(targetDate);
          if (currentDayOfTargetDate !== slot.dayOfWeek) {
            targetDate = new Date(
              targetDate.setDate(
                targetDate.getDate() +
                  ((slot.dayOfWeek + 7 - currentDayOfTargetDate) % 7)
              )
            );
          }

          const [startHours, startMinutes] = slot.startTime
            .split(":")
            .map(Number);
          const [endHours, endMinutes] = slot.endTime.split(":").map(Number);

          const startTime = new Date(targetDate);
          startTime.setHours(startHours, startMinutes, 0, 0);
          const endTime = new Date(targetDate);
          endTime.setHours(endHours, endMinutes, 0, 0);

          generatedEvents.push({
            title: "Livre",
            start: startTime,
            end: endTime,
            type: "available",
          });
        }
      } else if (slot.date) {
        const slotDate = new Date(slot.date);
        const [startHours, startMinutes] = slot.startTime
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = slot.endTime.split(":").map(Number);

        const startTime = new Date(slotDate);
        startTime.setHours(startHours, startMinutes, 0, 0);
        const endTime = new Date(slotDate);
        endTime.setHours(endHours, endMinutes, 0, 0);

        generatedEvents.push({
          title: "Livre",
          start: startTime,
          end: endTime,
          type: "available",
        });
      }
    });

    // Rescheduled classes - ONLY CONFIRMED
    rescheduledClasses.forEach((rescheduled) => {
      if (rescheduled.status === 'confirmed') {
        const dateTimeString = `${rescheduled.newDate}T${rescheduled.newTime}:00`;
        const startTime = new Date(dateTimeString);
        const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration

        generatedEvents.push({
          title: `${rescheduled.studentName || "Aluno"}`,
          start: startTime,
          end: endTime,
          type: "rescheduled",
          status: rescheduled.status,
          studentId: rescheduled.studentId,
        });
      }
    });

    return generatedEvents;
  }, [students]);

  // Custom event style with larger week view
  const eventStyleGetter = (event: CalendarEvent) => {
    let bgColor = "var(--event-bg-color)";
    let borderColor = "var(--event-border-color)";
    let height = "auto";
    let padding = "0 4px";
    let fontSize = "0.80rem";
    let minHeight = "auto";
    let lineHeight = "1.4";

    if (event.type === "available") {
      bgColor = "var(--available-bg-color)";
      borderColor = "var(--available-border-color)";
    } else if (event.type === "rescheduled") {
      bgColor = "var(--rescheduled-bg-color)";
      borderColor = "var(--rescheduled-border-color)";
    }

    // Make time views (week/day) events larger
    if (currentView === Views.WEEK || currentView === Views.DAY) {
      padding = "8px 10px";
      fontSize = "0.85rem";
      height = "100%";
      minHeight = "35px";
      lineHeight = "1.3";
    }

    return {
      style: {
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderRadius: "6px",
        color: "var(--event-text-color)",
        border: "none",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        padding,
        fontSize,
        height,
        minHeight,
        lineHeight,
        display: "flex",
        flexDirection: "row" as CSSProperties["flexDirection"],
        justifyContent: "start",
        alignItems: "center",
      },
    };
  };

  return (
    <div className="flex flex-col p-2 rounded-xl shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-fluency-text-light dark:text-fluency-text-dark flex items-center">
          <FiCalendar className="mr-2 text-fluency-blue-500 dark:text-fluency-blue-400" />
          Calendário de Aulas
        </h2>

        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#4a9eff] dark:bg-[#3a7bd5] rounded-sm mr-2"></div>
            <span className="text-sm">Aula Regular</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#4aef5f] dark:bg-[#3aaf4d] rounded-sm mr-2"></div>
            <span className="text-sm">Horário Disponível</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#ffa84a] dark:bg-[#d58a3a] rounded-sm mr-2"></div>
            <span className="text-sm">Aula Remarcada</span>
          </div>
        </div>
      </div>

      <div className="bg-fluency-gray-50 dark:bg-fluency-gray-800 rounded-xl overflow-hidden shadow-inner h-[65vh] min-h-[500px] transition-all duration-300">
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
              <div className="rbc-event-content w-full h-full flex flex-col justify-center">
                <div className="font-semibold truncate">{event.title}</div>
              </div>
            ),
          }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          className="
            [--event-bg-color:#4a9eff] dark:[--event-bg-color:#3a7bd5] 
            [--event-text-color:#ffffff] 
            [--event-border-color:#3a7bd5] dark:[--event-border-color:#2a5b9d]
            
            [--available-bg-color:#4aef5f] dark:[--available-bg-color:#3aaf4d] 
            [--available-border-color:#3aaf4d] dark:[--available-border-color:#2a8d3a]
            
            [--rescheduled-bg-color:#ffa84a] dark:[--rescheduled-bg-color:#d58a3a] 
            [--rescheduled-border-color:#d58a3a] dark:[--rescheduled-border-color:#a56a2a]
          "
        />
      </div>

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

      <style jsx global>{`
        /* Calendar container */
        .rbc-calendar {
          background: transparent;
          border-radius: 0.4rem;
          padding: 0.5rem;
          color: var(--fluency-text-light);
        }

        .dark .rbc-calendar {
          color: var(--fluency-text-dark);
        }

        /* COMPACT WEEK VIEW HEADER */
        .rbc-time-header {
          height: 60px !important; /* Reduced from 90px */
        }
        
        .rbc-time-header > .rbc-row:first-child {
          height: 30px !important; /* Date row height */
        }
        
        .rbc-time-header > .rbc-row:last-child {
          height: 30px !important; /* Day name row height */
        }
        
        .rbc-header {
          padding: 4px 6px !important; /* Reduced padding */
          font-size: 0.85rem !important; /* Smaller font */
        }
        
        .rbc-header > span:first-child {
          font-size: 1.1rem; /* Date number */
          font-weight: bold;
          display: block;
          margin-bottom: 2px;
        }
        
        .rbc-header > span:last-child {
          font-size: 0.75rem; /* Day name */
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
        }
        
        .rbc-time-gutter {
          padding-top: 0 !important;
        }
        
        .rbc-time-gutter .rbc-timeslot-group {
          height: 60px !important;
          padding: 0 !important;
        }
        
        .rbc-time-gutter .rbc-label {
          padding: 2px 6px !important;
          font-size: 0.8rem !important;
          transform: translateY(-50%);
          position: relative;
          top: 50%;
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

        /* Time slots - Increased height for week/day views */
        .rbc-time-view .rbc-time-slot {
          height: 60px !important;
        }

        .rbc-time-slot {
          color: var(--fluency-text-light);
          border-bottom: 1px solid var(--fluency-gray-200);
        }

        .dark .rbc-time-slot {
          color: var(--fluency-text-dark);
          border-bottom: 1px solid var(--fluency-gray-700);
        }

        /* Remove intermediate horizontal lines */
        .rbc-time-view .rbc-time-slot:not(:first-child) {
          border-top: none !important;
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

        /* Event improvements */
        .rbc-event {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .rbc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          z-index: 1;
        }

        /* Week and Day view specific adjustments */
        .rbc-time-view .rbc-event {
          min-height: 35px;
          margin-top: 3px;
          margin-bottom: 3px;
        }

        .rbc-time-view .rbc-event-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          padding: 0 4px;
          overflow: hidden;
        }

        /* Better alignment for event content */
        .rbc-event-content > div {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Remove vertical lines between events */
        .rbc-time-view .rbc-day-slot .rbc-event {
          border-right: none !important;
          border-left: none !important;
        }

        /* Cleaner event separation */
        .rbc-time-view .rbc-day-slot .rbc-event + .rbc-event {
          margin-top: 4px;
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
          
          .rbc-event-content {
            padding: 0 2px !important;
          }
          
          .rbc-event {
            font-size: 0.75rem !important;
            min-height: 30px !important;
          }
          
          .rbc-time-view .rbc-time-slot {
            height: 50px !important;
          }
          
          /* Compact header adjustments for mobile */
          .rbc-time-header {
            height: 50px !important;
          }
          
          .rbc-time-header > .rbc-row:first-child,
          .rbc-time-header > .rbc-row:last-child {
            height: 25px !important;
          }
          
          .rbc-header {
            padding: 2px 4px !important;
            font-size: 0.75rem !important;
          }
          
          .rbc-header > span:first-child {
            font-size: 0.9rem;
          }
          
          .rbc-header > span:last-child {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 480px) {
          .rbc-event {
            font-size: 0.7rem !important;
            min-height: 28px !important;
          }
          
          .rbc-time-view .rbc-time-slot {
            height: 45px !important;
          }
          
          .rbc-time-header {
            height: 45px !important;
          }
          
          .rbc-header > span:first-child {
            font-size: 0.8rem;
          }
          
          .rbc-header > span:last-child {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentCalendarView;