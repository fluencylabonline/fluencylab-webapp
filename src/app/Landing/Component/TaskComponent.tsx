"use client";
import { useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion"; // Import motion

// Define the structure of a task
type Task = {
  task: string;
  done: boolean;
  link?: string;
};

// Define the structure of the tasks state
type TasksState = {
  Task: Task[];
};

const TaskComponent = () => {
  const [tasks, setTasks] = useState<TasksState>({
    Task: [
      { task: "Revise as tarefas na plataforma 📖", done: false },
      {
        task: "Clique para treinar o ouvido 🎧",
        done: true,
        link: "/games/listening",
      },
      { task: "Marque sua aula teste 😉", done: false },
    ],
  });

  const handleTaskStatusChange = (
    taskType: keyof TasksState,
    index: number,
    checked: boolean
  ) => {
    const updatedTasks = tasks[taskType].map((task, i) =>
      i === index ? { ...task, done: checked } : task
    );

    setTasks((prev) => ({ ...prev, [taskType]: updatedTasks }));

    if (checked) {
      toast.success("Tarefa concluída!");
    } else {
      toast.error("Tarefa desmarcada!");
    }
  };

  const taskCompletionPercentage =
    (tasks.Task.filter((task) => task.done).length / tasks.Task.length) * 100;

  // Framer Motion variants for staggered list animation
  const containerVariants = {
    hidden: { opacity: 0, y: 50 }, // Start slightly below and invisible
    visible: {
      opacity: 1,
      y: 0, // Move to original position
      transition: {
        duration: 0.5, // Duration for the container itself
        staggerChildren: 0.1, // Stagger tasks by 0.1 seconds
        when: "beforeChildren", // Animate parent before children
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    // Use motion.div for the main container and apply whileInView
    <motion.div
      className="w-full flex flex-col items-center p-3 text-black dark:text-white bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible" // Trigger animation when in view
      viewport={{ once: true, amount: 0.5 }} // Only animate once, when 50% of it is in view
    >
      <div className="w-full lg:flex lg:flex-row lg:justify-around lg:items-center lg:gap-4 md:flex md:flex-col md:justify-between md:items-center md:gap-2 flex flex-col justify-center items-center gap-2">
        <h1 className="p-1 font-semibold text-xl">Tarefas</h1>
        <div className="w-full flex justify-center p-1">
          <div className="w-full bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-lg">
            {/* Animate the width of the progress bar */}
            <motion.div
              className="w-full bg-green-500 text-xs leading-none py-1 text-center font-normal text-white rounded-lg"
              initial={{ width: 0 }} // Start from 0 width
              animate={{ width: `${taskCompletionPercentage}%` }} // Animate to the calculated percentage
              transition={{ duration: 0.5, ease: "easeOut" }} // Smooth transition
            >
              <p className="pl-2">{taskCompletionPercentage.toFixed()}%</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:items-start md:items-start sm:items-center w-full max-h-[90%] mt-1 mb-3 mx-2 p-2 pb-4 rounded-md overflow-hidden overflow-y-scroll bg-fluency-gray-100 dark:bg-fluency-bg-dark">
        {/* The task list div doesn't need additional whileInView as its parent handles it */}
        <motion.div
          className="p-1 w-full h-max overflow-hidden overflow-y-scroll"
          // These are inherited from the parent motion.div's whileInView
          // and the staggerChildren transition
          // initial="hidden" // No longer needed here explicitly
          // animate="visible" // No longer needed here explicitly
        >
          {tasks &&
            tasks.Task &&
            tasks.Task.map((task, index) => (
              // Use motion.div for each task item
              <motion.div
                key={index}
                className="flex flex-row mt-1 justify-between gap-2 items-center bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-700 hover:dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 p-[0.25rem] px-3 rounded-md"
                variants={itemVariants} // Apply item animation variants
              >
                <div className="flex flex-row gap-2 items-center">
                  <label
                    className="relative flex items-center p-3 rounded-full cursor-pointer"
                    htmlFor={`checkbox-${index}`}
                  >
                    <input
                      className="before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none rounded-md border border-fluency-gray-500 dark:border-fluency-gray-100 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-fluency-green-700 checked:bg-fluency-green-700 checked:before:bg-fluency-green-700 hover:before:opacity-10"
                      id={`checkbox-${index}`}
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        handleTaskStatusChange("Task", index, e.target.checked)
                      }
                    />
                    <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </span>
                  </label>
                  <label htmlFor={`task-${index}`}>
                    {task.link ? (
                      <Link href={task.link}>
                        <span className="font-semibold">{task.task}</span>
                      </Link>
                    ) : (
                      <span className="font-semibold">{task.task}</span>
                    )}
                  </label>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </div>

      <Toaster />
    </motion.div>
  );
};

export default TaskComponent;