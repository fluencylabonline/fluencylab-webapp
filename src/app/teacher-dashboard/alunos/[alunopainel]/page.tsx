"use client";
import React from "react";
import PlacementCard from "../Components/PlacementCard";
import MateriaisCard from "../Components/MateriaisCard";
import TaskCard from "../Components/TaskCard";
import LessonCard from "../Components/LessonCard";
import TeacherManagedAchievements from "@/app/ui/Components/Achievements/components/TeacherManagedAchievement";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";
import Tour from "@/app/ui/Components/JoyRide/FluencyTour";
import { useSession } from "next-auth/react";

function AlunoPainel() {
  const [id, setId] = React.useState<string | null>(null);
  const { data: session } = useSession();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("student");
    setId(urlId);
  }, []);

  if (!id) {
    return <SpinningLoader />;
  }

    const tourSteps = [
    {
      target: '.tour-view-lesson',
      title: 'Lições e Tarefas',
      content: 'Aqui está tudo relacionado às aulas e pode gerenciar as tarefas do aluno por aqui.',
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-materials',
      title: 'Arquivos e Nivelamento',
      content: 'Salve arquivos de todo tipo aqui para seu aluno e os últimos nivelamentos vão aparecer aqui.',
      placement: 'bottom' as const,
    },
  ];

  return (
    <div className="fade-in fade-out px-3 min-w-screen h-max overflow-hidden">

        <Tour 
          steps={tourSteps}
          pageKey="teacher-panel-student-card"
          userId={session?.user.id}
          delay={1000}
          onTourEnd={() => console.log('Teacher lesson card tour completed')}
        />

      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-3">
        <div className="flex flex-col gap-3 w-full">
          <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2 w-full tour-view-lesson">
            <LessonCard studentId={id} />
            <TaskCard studentId={id} />
          </div>

          <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-3 w-full tour-materials">
            <MateriaisCard studentId={id} />
            <PlacementCard studentId={id} />
          </div>
        </div>

        {/* Adicionar um vídeo ou modal com explicação aqui */}
        <TeacherManagedAchievements studentId={id} language="english"/>
      </div>
    </div>
  );
}

export default AlunoPainel;
