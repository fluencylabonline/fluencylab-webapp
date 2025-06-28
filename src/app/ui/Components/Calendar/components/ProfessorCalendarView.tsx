// /home/ubuntu/src/app/professor/remarcacao/components/ProfessorCalendarView.tsx
"use client";

import React from "react";
import { useProfessorData } from "@/app/hooks/useProfessorData";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent"; // Adjust path if needed
import StudentCalendarView from "../StudentCalendarView";

const ProfessorCalendarView: React.FC = () => {
  const { availableSlots, students, rescheduledClasses, loading } = useProfessorData();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
        <SpinningLoader />
      </div>
    );
  }

  // Basic rendering - Replace with actual calendar implementation
  return (
<StudentCalendarView 
      students={students} 
      availableSlots={availableSlots}
      rescheduledClasses={rescheduledClasses}
    />  );
};

export default ProfessorCalendarView;

