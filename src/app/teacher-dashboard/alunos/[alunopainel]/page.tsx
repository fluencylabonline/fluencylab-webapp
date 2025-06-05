"use client";
import React from "react";
import PlacementCard from "../Components/PlacementCard";
import MateriaisCard from "../Components/MateriaisCard";
import TaskCard from "../Components/TaskCard";
import LessonCard from "../Components/LessonCard";
import TeacherManagedAchievements from "@/app/ui/Components/Achievements/components/TeacherManagedAchievement";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";

function AlunoPainel() {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("id");
    setId(urlId);
  }, []);

  if (!id) {
    return <SpinningLoader />;
  }

  return (
    <div className="fade-in fade-out px-3 min-w-screen h-max overflow-hidden">
      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-3">
        <div className="flex flex-col gap-3 w-full">
          <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2 w-full">
            <LessonCard studentId={id} />
            <TaskCard studentId={id} />
          </div>

          <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-3 w-full">
            <MateriaisCard studentId={id} />
            <PlacementCard studentId={id} />
          </div>
        </div>

        <TeacherManagedAchievements studentId={id} language="english" />
      </div>
    </div>
  );
}

export default AlunoPainel;
