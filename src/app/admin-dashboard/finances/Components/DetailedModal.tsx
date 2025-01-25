import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuExpand } from "react-icons/lu";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DetailedModal() {
  const [newStudentsCount, setNewStudentsCount] = useState(0);
  const [cancellationsCount, setCancellationsCount] = useState(0);
  const [procuras, setProcuras] = useState(0);
  const [desistencias, setDesistencias] = useState(0);

  const [previousNewStudentsCount, setPreviousNewStudentsCount] = useState(0);
  const [previousCancellationsCount, setPreviousCancellationsCount] = useState(0);
  const [percentageIncreaseStudents, setPercentageIncreaseStudents] = useState(0);

  const [percentageIncreaseCancellations, setPercentageIncreaseCancellations] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [chartData, setChartData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear()); // Selected year

  const db = getFirestore();

  const updateStudentCycle = async (field: string, value: number) => {
    const selectedDateId = `${selectedYear}-${selectedMonth}`; // Format as "YYYY-MM"
    const cycleRef = doc(db, "student-cycle", selectedDateId);
  
    try {
      const cycleSnapshot = await getDoc(cycleRef);
      if (cycleSnapshot.exists()) {
        // Update the existing document
        await updateDoc(cycleRef, { [field]: value });
      } else {
        // Create a new document if it doesn't exist
        await setDoc(cycleRef, { [field]: value });
      }
    } catch (error) {
      console.error("Error updating student cycle:", error);
    }
  };

  const handleProcurasChange = (change: number) => {
    const newProcuras = procuras + change;
    setProcuras(newProcuras);
    updateStudentCycle("procuras", newProcuras);
  };
  
  const handleDesistenciasChange = (change: number) => {
    const newDesistencias = desistencias + change;
    setDesistencias(newDesistencias);
    updateStudentCycle("desistencias", newDesistencias);
  };
  
  useEffect(() => {
    const selectedDateId = `${selectedYear}-${selectedMonth}`; // Format as "YYYY-MM"
    const cycleRef = doc(db, "student-cycle", selectedDateId);
  
    const unsubscribe = onSnapshot(cycleRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProcuras(data.procuras || 0);
        setDesistencias(data.desistencias || 0);
      } else {
        setProcuras(0);
        setDesistencias(0);
      }
    });
  
    return () => unsubscribe();
  }, [selectedYear, selectedMonth]); // Updates dynamically when month or year changes  

  const calculateNewstudentsandCancelings = async () => {
    const usersRef = collection(db, "users");
    const studentsQuery = query(usersRef, where("role", "==", "student"));

    const pastStudentsRef = collection(db, "past_students");
    const pastStudentsQuery = query(pastStudentsRef, where("role", "==", "student"));

    const selectedDate = new Date(`${selectedYear}-${selectedMonth}-01`);

    try {
      // Get new students and cancellations for the selected month
      let newStudents = 0;
      let cancellations = 0;
      
      // Process active students for selected month
      const studentsSnapshot = await getDocs(studentsQuery);
      studentsSnapshot.forEach((doc) => {
        const userData = doc.data();
        const mensalidade = userData.mensalidade;
        const comecouEm = userData.comecouEm;
        if (mensalidade && comecouEm) {
          const comecouEmDate = new Date(comecouEm);
          if (
            comecouEmDate.getFullYear() === selectedDate.getFullYear() &&
            comecouEmDate.getMonth() === selectedDate.getMonth()
          ) {
            newStudents++;
          }
        }
      });

      // Process past students for selected month
      const pastStudentsSnapshot = await getDocs(pastStudentsQuery);
      pastStudentsSnapshot.forEach((doc) => {
        const userData = doc.data();
        const mensalidade = userData.mensalidade;
        const comecouEm = userData.comecouEm;
        const encerrouEm = userData.encerrouEm;

        if (mensalidade && comecouEm) {
          const comecouEmDate = new Date(comecouEm);
          const encerrouEmDate = encerrouEm ? new Date(encerrouEm) : null;

          if (comecouEmDate <= selectedDate && (!encerrouEmDate || encerrouEmDate > selectedDate)) {
            // Count cancellations
            if (
              encerrouEmDate &&
              encerrouEmDate.getFullYear() === selectedDate.getFullYear() &&
              encerrouEmDate.getMonth() === selectedDate.getMonth()
            ) {
              cancellations++;
            }
          }
        }
      });

      // Set the counts for the current month
      setNewStudentsCount(newStudents);
      setCancellationsCount(cancellations);

      // Now calculate data for the previous month
      const previousMonthDate = new Date(selectedDate);
      previousMonthDate.setMonth(selectedDate.getMonth() - 1);

      const prevSelectedMonth = previousMonthDate.getMonth() + 1;
      const prevSelectedYear = previousMonthDate.getFullYear();

      let prevNewStudents = 0;
      let prevCancellations = 0;

      // Get previous month's data for new students and cancellations
      const prevSelectedDate = new Date(`${prevSelectedYear}-${prevSelectedMonth}-01`);
      
      const prevStudentsSnapshot = await getDocs(studentsQuery);
      prevStudentsSnapshot.forEach((doc) => {
        const userData = doc.data();
        const mensalidade = userData.mensalidade;
        const comecouEm = userData.comecouEm;
        if (mensalidade && comecouEm) {
          const comecouEmDate = new Date(comecouEm);
          if (
            comecouEmDate.getFullYear() === prevSelectedDate.getFullYear() &&
            comecouEmDate.getMonth() === prevSelectedDate.getMonth()
          ) {
            prevNewStudents++;
          }
        }
      });

      const prevPastStudentsSnapshot = await getDocs(pastStudentsQuery);
      prevPastStudentsSnapshot.forEach((doc) => {
        const userData = doc.data();
        const mensalidade = userData.mensalidade;
        const comecouEm = userData.comecouEm;
        const encerrouEm = userData.encerrouEm;

        if (mensalidade && comecouEm) {
          const comecouEmDate = new Date(comecouEm);
          const encerrouEmDate = encerrouEm ? new Date(encerrouEm) : null;

          if (comecouEmDate <= prevSelectedDate && (!encerrouEmDate || encerrouEmDate > prevSelectedDate)) {
            // Count cancellations
            if (
              encerrouEmDate &&
              encerrouEmDate.getFullYear() === prevSelectedDate.getFullYear() &&
              encerrouEmDate.getMonth() === prevSelectedDate.getMonth()
            ) {
              prevCancellations++;
            }
          }
        }
      });

      // Set previous month counts
      setPreviousNewStudentsCount(prevNewStudents);
      setPreviousCancellationsCount(prevCancellations);

      // Calculate percentage increase for new students and cancellations
      const newStudentsIncrease = prevNewStudents === 0 ? 0 : ((newStudents - prevNewStudents) / prevNewStudents) * 100;
      const cancellationsIncrease = prevCancellations === 0 ? 0 : ((cancellations - prevCancellations) / prevCancellations) * 100;

      setPercentageIncreaseStudents(newStudentsIncrease);
      setPercentageIncreaseCancellations(cancellationsIncrease);

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    calculateNewstudentsandCancelings();
  }, [selectedMonth, selectedYear]); // Re-run the calculation when month or year changes

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const fetchYearlyData = async (selectedYear: number) => {
    const usersRef = collection(db, "users");
    const pastStudentsRef = collection(db, "past_students");
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const monthlyData = await Promise.all(
      months.map(async (month) => {
        const selectedDate = new Date(`${selectedYear}-${month}-01`);
        const monthStart = selectedDate.toISOString().slice(0, 10);
        const nextMonth = new Date(selectedDate.setMonth(selectedDate.getMonth() + 1));
        const monthEnd = nextMonth.toISOString().slice(0, 10);

        const [studentsSnapshot, pastStudentsSnapshot] = await Promise.all([
          getDocs(query(usersRef, where("comecouEm", ">=", monthStart), where("comecouEm", "<", monthEnd))),
          getDocs(query(pastStudentsRef, where("encerrouEm", ">=", monthStart), where("encerrouEm", "<", monthEnd))),
        ]);

        const newStudentsCount = studentsSnapshot.size;
        const cancellationsCount = pastStudentsSnapshot.size;

        return { month, newStudentsCount, cancellationsCount };
      })
    );

    setChartData(monthlyData);
  };

  useEffect(() => {
    fetchYearlyData(year);
  }, [year]);

  const handleYearChangeLine = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.target.value, 10));
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      Filler,
      legend: {
        display: false, // Hides the legend at the top
      },
      tooltip: {
        enabled: true, // Keeps tooltips enabled
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };  

  const data = {
    labels: months,
    datasets: [
      {
        label: "Novos Alunos",
        data: chartData ? chartData.map((d: any) => d.newStudentsCount) : Array(12).fill(0),
        borderColor: "rgb(63, 81, 181)",
        backgroundColor: "rgba(63, 81, 181, 0.2)",
        lineTension: 0.4,
        pointRadius: 0,
        hitRadius: 10,
        fill: true
      },
      {
        label: "Cancelamentos",
        data: chartData ? chartData.map((d: any) => d.cancellationsCount) : Array(12).fill(0),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        lineTension: 0.4,
        pointRadius: 0,
        hitRadius: 10,
        fill: true
      },
    ],
  };

  return (
    <>
    <button onClick={() => setIsModalOpen(true)}>
      <LuExpand className='w-6 h-6 hover:text-green-500 duration-300 ease-in-out transition-all' />
    </button>
      
    {isModalOpen && (   
    <div className="fixed inset-0 bg-black dark:bg-gray-600 bg-opacity-50 dark:bg-opacity-50 flex justify-center items-center z-50">
      <div className="flex flex-col bg-fluency-bg-light dark:bg-fluency-pages-dark rounded-lg p-4 w-full h-[95vh] overflow-y-auto m-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Visão detalhada</h2>
        <IoClose
          onClick={() => setIsModalOpen(false)}
          className="icon cursor-pointer absolute top-5 right-16 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
        />
      <div className="lg:flex lg:flex-row md:flex md:flex-col flex flex-col w-full p-2 gap-4 justify-evenly">
        <div className="lg:flex lg:flex-col md:flex md:flex-col flex flex-col lg:items-start lg:justify-start md:items-center md:justify-center items-center justify-center w-full overflow-y-auto gap-4 bg-fluency-gray-100 dark:bg-fluency-bg-dark rounded-md p-6">
          <div className="lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center gap-4">
            <select value={selectedMonth} onChange={handleMonthChange} className="px-4 py-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark">
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            <select value={selectedYear} onChange={handleYearChange} className="px-4 py-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark">
              {[...Array(3)].map((_, i) => {
                const pastYear = new Date().getFullYear() - i;
                return (
                  <option key={pastYear} value={pastYear}>
                    {pastYear}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center gap-4">
            <div className="w-56 h-36 flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-indigo-500">
              <p className="font-bold text-xl text-white">Novos alunos</p>
              <div className="font-bold text-white flex flex-row items-center justify-between w-full gap-1 mt-3">
                <p className="flex flex-row items-center gap-1">
                  {newStudentsCount > 0 ? (
                    <IoMdArrowRoundUp className="text-green-500" />
                  ) : newStudentsCount < 0 ? (
                    <IoMdArrowRoundDown className="text-red-500" />
                  ) : null}
                  <span className="text-lg">{newStudentsCount}</span>
                </p>
                {previousNewStudentsCount !== 0 && (
                  <p className="font-medium text-sm text-white">
                    {percentageIncreaseStudents > 0 ? "+" : ""}
                    {percentageIncreaseStudents.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>

            <div className="w-56 h-36 flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-amber-500">
              <p className="font-bold text-xl text-white">Cancelamentos</p>
              <div className="font-bold text-white flex flex-row items-center justify-between w-full gap-1 mt-3">
                <p className="flex flex-row items-center gap-1">
                  {cancellationsCount > 0 ? (
                    <IoMdArrowRoundDown className="text-red-700" />
                  ) : cancellationsCount < 0 ? (
                    <IoMdArrowRoundUp className="text-green-700" />
                  ) : null}
                  <span className="text-lg">{cancellationsCount}</span>
                </p>
                {previousCancellationsCount !== 0 && (
                  <p className="font-medium text-sm text-white">
                    {percentageIncreaseCancellations > 0 ? "+" : ""}
                    {percentageIncreaseCancellations.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center gap-4">
            <div className="w-56 h-36 flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-fluency-gray-600">
              <p className="font-bold text-xl text-white">Procuras</p>
              <p className="font-bold text-white flex flex-row items-center gap-1">
                <button
                  className="text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleProcurasChange(1)}
                >
                  +
                </button>
                  {procuras > 0 ? (
                    <IoMdArrowRoundUp className="text-green-500" />
                  ) : procuras < 0 ? (
                    <IoMdArrowRoundDown className="text-red-500" />
                  ) : null}
                  <span className="text-lg">{procuras}</span>
                <button
                  className="text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleProcurasChange(-1)}
                >
                  -
                </button>
              </p>
            </div>

            <div className="w-56 h-36 flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-fluency-gray-600">
              <p className="font-bold text-xl text-white">Desistências</p>
              <p className="font-bold text-white flex flex-row items-center gap-1">
                <button
                  className="text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleDesistenciasChange(1)}
                >
                  +
                </button>
                  {desistencias > 0 ? (
                    <IoMdArrowRoundUp className="text-red-500" />
                  ) : desistencias < 0 ? (
                    <IoMdArrowRoundDown className="text-green-500" />
                  ) : null}
                  <span className="text-lg">{desistencias}</span>
                <button
                  className="text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleDesistenciasChange(-1)}
                >
                  -
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-auto bg-fluency-gray-100 dark:bg-fluency-bg-dark rounded-md">
          <div className="p-6 w-full h-full flex flex-col items-end">
            <select
              id="year-select"
              value={year}
              onChange={handleYearChangeLine}
              className="px-4 py-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark mb-4"
            >
              {[...Array(3)].map((_, i) => {
                const pastYear = new Date().getFullYear() - i;
                return (
                  <option key={pastYear} value={pastYear}>
                    {pastYear}
                  </option>
                );
              })}
            </select>
            <Line options={chartOptions} data={data} />
          </div>
        </div>
      </div>
        
      </div>
    </div>)}
  </>
  );
}