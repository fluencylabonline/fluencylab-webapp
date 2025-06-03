import { db } from "@/app/firebase";
import { doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import FluencyButton from "../../Components/Button/button";
import { useState, useEffect } from "react";

    interface StudentTasksProps {
        onClose: any;
        isOpen: any;
    }

const StudentTasks: React.FC<StudentTasksProps> = ({ onClose, isOpen }) => {
    const params = new URLSearchParams(window.location.search);
    const studentID = params.get("student") || "";
    const [tasks, setTasks] = useState<any>({});
          useEffect(() => {
            const fetchTasks = async () => {
              try {
                const studentDocRef = doc(db, `users/${studentID}`);
                const unsubscribe = onSnapshot(studentDocRef, (doc) => {
                  if (doc.exists()) {
                    const studentData = doc.data();
                    setTasks(studentData.tasks || {});
                  }
                });
                return unsubscribe;
              } catch (error) {
                console.error('Error fetching tasks:', error);
              }
            };
        
            const unsubscribe = fetchTasks();
            if (unsubscribe instanceof Function) {
              return () => unsubscribe();
            }
          }, [studentID]);

        const handleAddTask = async (day: string, task: string, done: boolean) => {
          try {
              const studentDocRef = doc(db, `users/${studentID}`);
              await updateDoc(studentDocRef, {
                  [`tasks.${day}`]: arrayUnion({ task, done })
              });
              toast.success('Tarefa Adicionada!', {
                position: "top-center",
              });
            } catch (error) {
                console.error('Error adding task:', error);
            }
        };
        
        const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, day: string) => {
          if (event.key === 'Enter' && event.currentTarget.value.trim() !== '') {
              const enteredTask = event.currentTarget.value.trim();
              const taskIdSeparatorIndex = enteredTask.indexOf(':');
              if (taskIdSeparatorIndex !== -1) {
                  const taskId = enteredTask.slice(0, taskIdSeparatorIndex).trim();
                  if (tasks && tasks[day]) {
                      const taskIndex = tasks[day].findIndex((task: any) => task.task === taskId);
                      if (taskIndex !== -1) {
                          const updatedTasks = [...tasks[day]];
                          updatedTasks[taskIndex].done = !updatedTasks[taskIndex].done;
                          handleTaskStatusChange(day, taskIndex, updatedTasks[taskIndex].done);
                      } else {
                          handleAddTask(day, enteredTask, false);
                      }
                  }
              } else {
                  handleAddTask(day, enteredTask, false);
              }
              event.currentTarget.value = '';
          }
        };

        const handleTaskStatusChange = async (day: string, index: number, done: boolean) => {
          try {
              const updatedTasks = [...tasks[day]];
              updatedTasks[index].done = done;
      
              const studentDocRef = doc(db, `users/${studentID}`);
              await updateDoc(studentDocRef, {
                  [`tasks.${day}`]: updatedTasks
              });
      
              setTasks((prevTasks: { [x: string]: any; }) => ({
                  ...prevTasks,
                  [day]: updatedTasks
              }));
      
              const taskStatus = done ? 'marcada como concluída' : 'marcada como não concluída';
              const toastColor = done ? 'success' : 'error';
              toast[toastColor](`Tarefa ${taskStatus}!`, {
                  position: "top-center",
              });

          } catch (error) {
              console.error('Error updating task status:', error);
          }
      };

      const handleDeleteTask = async (day: string, index: number) => {
        try {
            const updatedTasks = [...tasks[day]];
            updatedTasks.splice(index, 1);
    
            const studentDocRef = doc(db, `users/${studentID}`);
                await updateDoc(studentDocRef, {
                    [`tasks.${day}`]: updatedTasks
                });
    
            setTasks((prevTasks: { [x: string]: any }) => ({
                ...prevTasks,
                [day]: updatedTasks
            }));
    
            toast.error('Tarefa deletada!', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Erro ao deletar tarefa!', {
                position: "top-center",
            });
        }
    };

  const [taskCompletionPercentage, setTaskCompletionPercentage] = useState<number>(0);
  const [tasksCompletedToastShown, setTasksCompletedToastShown] = useState<boolean>(false);

    useEffect(() => {
        setTaskCompletionPercentage(calculateTaskCompletionPercentage());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);

    const calculateTaskCompletionPercentage = () => {
if (!tasks || !tasks.Task || (Array.isArray(tasks.Task) ? tasks.Task.length === 0 : false)) return 0;

const totalTasks = Array.isArray(tasks.Task) ? tasks.Task.length : 1;

const completedTasks = (Array.isArray(tasks.Task) ? tasks.Task : [tasks.Task])
  .filter((task: any) => task.done).length;

return (completedTasks / totalTasks) * 100;

    };

    useEffect(() => {
        const completionPercentage = calculateTaskCompletionPercentage();
        const progressInterval = setInterval(() => {
            setTaskCompletionPercentage((prevPercentage) => {
                if (prevPercentage >= completionPercentage) {
                    clearInterval(progressInterval);
                    if (completionPercentage >= 100 && !tasksCompletedToastShown) {
                        toast.success('Parabéns! Você completou todas as tarefas!', {
                            position: 'top-center',
                        });
                        setTasksCompletedToastShown(true);
                    } return completionPercentage;
                } return prevPercentage + 1;
            });
        }, 10);
        return () => clearInterval(progressInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, tasksCompletedToastShown]);
    
    return(
        <div>
            {isOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden flex flex-col justify-center items-center shadow-xl transform transition-all w-max mx-8 h-[80vh] p-6 px-10">
                            <FluencyCloseButton onClick={onClose} />
                            <h1 className='p-1 font-semibold text-2xl text-center'>Tarefas</h1>
                            <div className='w-full flex flex-row items-center justify-around'>
                                <div className="flex justify-center">
                                    <div className="lg:w-72 md:w-72 w-52 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-lg">
                                        <div
                                            className="bg-green-500 text-xs leading-none py-1 text-center font-normal text-white rounded-lg"
                                            style={{ width: `${taskCompletionPercentage}%`, transition: 'width 0.4s linear' }}
                                            >
                                            <p className='pl-2'>{taskCompletionPercentage.toFixed()}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                  
                            <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-center items-center gap-2 pb-2 mt-4'>
                                <input className='lg:w-[26rem] md:w-[22rem] w-[17rem] border-fluency-gray-100 outline-none focus:border-fluency-red-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-400 dark:text-fluency-gray-100 text-fluency-gray-800 rounded-md p-2 h-8' 
                                placeholder='Adicionar Tarefa: Segunda - Treinar a atividade 1.2' id="taskInput"
                                onKeyPress={(e) => handleKeyPress(e, 'Task')} />
                                <FluencyButton className='hidden w-max p-2 h-8 lg:text-md md:text-sm sm:text-xs' variant='warning'>Modelos de Tarefa</FluencyButton>
                            </div>
            
                            <div className='p-1 w-full h-[50vh] overflow-y-scroll'>            
                                {tasks && tasks.Task && tasks.Task.map((task: any, index: number) => (
                                <div key={index} className='flex flex-row mt-1 justify-between gap-2 items-center bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-700 hover:dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 p-[0.25rem] px-3 rounded-md'>
                                    <div className='flex flex-row gap-2 items-center'> 
                                    <label className="relative flex items-center p-3 rounded-full cursor-pointer" htmlFor="checkbox">
                                        <input 
                                        className="before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none rounded-md border border-fluency-gray-500 dark:border-fluency-gray-100 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-fluency-green-700 checked:bg-fluency-green-700 checked:before:bg-fluency-green-700 hover:before:opacity-10"
                                        id="checkbox"  
                                        type="checkbox"
                                        checked={task.done}
                                        onChange={(e) => handleTaskStatusChange('Task', index, e.target.checked)}/>
                                        <span
                                        className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"
                                            stroke="currentColor" strokeWidth="1">
                                            <path fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"></path>
                                        </svg>
                                        </span>
                                    </label>
                                    <span className='font-semibold'>{task.task}</span>
                                    </div>
                                    <MdDelete className='min-w-5 h-auto hover:text-fluency-red-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold' 
                                    onClick={() => handleDeleteTask('Task', index)} />
                                </div>))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentTasks;