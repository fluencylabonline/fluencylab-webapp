'use client';
import FlashCard from "@/app/SharedPages/Flashcard/FlashCard";
import WeeklyHeatmap from "@/app/SharedPages/Flashcard/components/WeeklyHeatmap";
import LearningProgress from "@/app/SharedPages/Flashcard/components/LearningProgress";

export default function FlashcardPage() {
  return (
    <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start justify-center gap-3 p-2 min-h-[85vh] w-full">
      <FlashCard />
      <div className="flex flex-col gap-2 w-full">
        <WeeklyHeatmap />
        <LearningProgress />
      </div>
    </div>
  );
}