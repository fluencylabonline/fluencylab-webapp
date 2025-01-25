import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { usePomodoro } from "@/app/context/PomodoroContext";
import { MdPause } from "react-icons/md";
import { VscDebugStart } from "react-icons/vsc";

const PomodoroClock: React.FC = () => {
  const { isPomodoroVisible, togglePomodoroVisibility } = usePomodoro();
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [message, setMessage] = useState("Vamos estudar");

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      setMessage("Sessão de estudo finalizada");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 10;
        setProgress(((20 * 60 - newTime) / (20 * 60)) * 100);
        return newTime;
      });
    }, 1000);

    if (timeLeft <= 10 * 60 && timeLeft > 5 * 60) {
      setMessage("Hora do intervalo");
    } else if (timeLeft <= 5 * 60 && timeLeft > 4 * 60) {
      setMessage("Hora de voltar a estudar");
    } else if (timeLeft <= 4 * 60 && timeLeft > 0) {
      setMessage("Continue estudando, falta pouco!");
    }

    return () => clearInterval(timer);
  }, [timeLeft, isRunning]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
    const sound = new Audio("/sounds/pomodoro.wav");
      sound.play();
  };

  if (!isPomodoroVisible) return null;

  return (
    <Draggable defaultPosition={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 }}>
      <div className="z-[9999] absolute flex flex-col justify-center items-center overflow-hidden bg-fluency-pages-light dark:bg-fluency-pages-dark w-44 h-44 rounded-xl p-4">
          <div
            className={`-z-10 absolute bottom-0 left-0 w-full transition-all duration-1000 bg-fluency-gray-200 dark:bg-fluency-gray-700 ${
              isRunning ? "transition-height" : "bg-indigo-500 dark:bg-indigo-900"
            }`}
            style={{
              height: `${progress}%`,
            }}
          ></div>
        <FluencyCloseButton onClick={togglePomodoroVisibility} />
        <h2 className={`mt-3 text-md font-semibold text-center ${timeLeft === 0 && 'text-white'}`}>{message}</h2>
        <div className={`text-2xl font-bold ${timeLeft === 0 && 'text-white'}`}>{formatTime(timeLeft)}</div>
        <button
          onClick={toggleTimer}
          className="text-white p-2"
        >
          {isRunning ? (
            <MdPause className="w-6 h-6 cursor-pointer hover:text-fluency-orange-500 duration-300 ease-in-out transition-all" />) 
           : (<VscDebugStart  className="w-6 h-6 cursor-pointer hover:text-indigo-800 duration-300 ease-in-out transition-all" />
          )}
        </button>
      </div>
    </Draggable>
  );
};

export default PomodoroClock;
