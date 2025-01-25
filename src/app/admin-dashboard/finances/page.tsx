'use client';
import { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { app } from "../../firebase";
import AddTransaction from "./Components/AddTransaction";
import FluencyInput from "@/app/ui/Components/Input/input";
import Filter from "./Components/Filter";
import { Timestamp } from "firebase/firestore";
import FinancialOverview from "./Components/FinancialOverview";
import FluencyButton from "@/app/ui/Components/Button/button";
import { MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Toaster } from "react-hot-toast";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  value: number;
  date: Timestamp;  // Explicitly define 'date' as a Firestore Timestamp
  receiptUrl?: string; // Optional field for image URL
  type: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null); // State for expanded item
  const [filter, setFilter] = useState<string | null>('all'); // Filter state
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear(); // Current year

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Default to current year

  const db = getFirestore(app);
  
  // Parse a date range like "24/10/2025 - 11/12/2025"
  const parseDateRange = (range: string) => {
    const match = range.match(/^(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})$/);
    if (!match) return null;

    const startDate = parseDate(match[1]);
    const endDate = parseDate(match[2]);

    return { startDate, endDate };
  };

  // Convert a date string like "24/10/2025" to a timestamp
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime(); // Return timestamp
  };

  // Fetch transactions in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [db]);

  // Format date to "DD/MM/YYYY" for comparison
  const formatDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter transactions based on selected month, year, and other criteria
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = transaction.date.toDate();
    const transactionMonth = transactionDate.getMonth() + 1; // 1-based month
    const transactionYear = transactionDate.getFullYear();

    const searchLower = searchTerm.toLowerCase();
    const formattedDate = formatDate(transaction.date); // Format the date

    const dateRange = parseDateRange(searchTerm); // Check if search term is a date range
    if (dateRange) {
      const { startDate, endDate } = dateRange;
      return transactionDate.getTime() >= startDate && transactionDate.getTime() <= endDate; // Filter by date range
    }

    // Filter based on category if filter is set
    if (filter && filter !== "all" && transaction.category !== filter) {
      return false;
    }

    // Filter based on selected month and year
    if (transactionMonth !== selectedMonth || transactionYear !== selectedYear) {
      return false;
    }

    return (
      transaction.name?.toLowerCase().includes(searchLower) || 
      transaction.category?.toLowerCase().includes(searchLower) ||
      formattedDate.includes(searchLower) // Compare the formatted date
    );
  });

  // Handle toggle for expanding/collapsing transaction details
  const handleToggle = (id: string) => {
    setExpandedTransactionId((prevId) => (prevId === id ? null : id));
  };

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Function to format the value based on the category
  const formatTransactionValue = (type: string, value: number): string => {
    if (type === "gasto") {
      return `-R$ ${value.toFixed(2).replace('.', ',')}`;
    } else if (type === "entrada") {
      return `+R$ ${value.toFixed(2).replace('.', ',')}`;
    }
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Function to set the text color based on the category
  const getTransactionValueColor = (type: string): string => {
    if (type === "gasto") return "text-red-500 dark:text-red-500 font-bold"; // Red for expenses
    if (type === "entrada") return "text-green-500 dark:text-green-500 font-bold"; // Green for income
    return "text-gray-800 dark:text-white font-bold"; // Default color
  };

  // Calculate the total income, expense, balance, and forecast for the month
  const calculateFinancialData = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    let forecast = 0;
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === "entrada") {
        totalIncome += transaction.value;
      } else if (transaction.type === "gasto") {
        totalExpense += transaction.value;
      }
      // Forecast logic (you can add your logic here)
      forecast += transaction.value;
    });

    const balance = totalIncome - totalExpense;
    return {
      totalIncome,
      totalExpense,
      balance,
    };
  };

  const financialData = calculateFinancialData(); 

  // Function to delete a transaction from Firestore
  const deleteTransaction = async (id: string) => {
    try {
      const transactionRef = doc(db, "transactions", id);
      await deleteDoc(transactionRef);
      alert("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      alert("Failed to delete transaction.");
    }
  };

  const cancelDelete = () => {
    setIsDeleting(null); // Cancel the deletion process
  };

  return (
    <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start w-full justify-around gap-2">
      <Toaster />
      <div className="w-full flex flex-col items-start gap-2 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-4">
        <div className="w-full lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-2">
          <div className="flex flex-row items-center gap-2 w-full">
          {/* Month Select */}
          <select 
            value={selectedMonth} 
            onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSearchTerm('');
              }}
              
            className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full py-2 rounded-lg border-2 font-medium transition-all"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index + 1}>
                {new Date(0, index).toLocaleString('default', { month: 'long' }).charAt(0).toUpperCase() + new Date(0, index).toLocaleString('default', { month: 'long' }).slice(1)}
              </option>
            ))}
          </select>

          {/* Year Select */}
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <option key={index} value={currentYear - index}>
                {currentYear - index}
              </option>
            ))}
          </select>
          </div>

          {/* Search Input */}
          <FluencyInput 
            placeholder="Pesquise aqui por nome, data ou intervalo de datas (ex: 24/10/2025 - 11/12/2025)" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
          />
          <div className="flex flex-row items-center gap-2">
            <AddTransaction />
            <Filter filter={filter} setFilter={setFilter} />
          </div>
        </div>

        <p className="flex font-bold text-xl self-center mt-2">{
          filter === 'mensalidade' && "Alunos" 
          || filter === 'professor' && "Professores" 
          || filter === 'cancelamento' && "Cancelamentos"
          || filter === 'despesa' && "Gastos"}</p>
        
        <ul className="w-full overflow-y-auto flex flex-col items-center gap-2">
          {filteredTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex flex-col justify-center items-center w-full bg-fluency-gray-50 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 hover:bg-fluency-gray-100 rounded-md p-2 py-3 px-4 text-fluency-gray-800 dark:text-white duration-300 ease-in-out transition-all"
            >
              {isDeleting === transaction.id ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Tem certeza que quer deletar {capitalizeFirstLetter(transaction.category)} de {transaction.name}?</span>
                  <FluencyButton
                    onClick={() => deleteTransaction(transaction.id)}
                    variant="confirm"
                  >
                    Sim
                  </FluencyButton>
                  <FluencyButton
                    onClick={cancelDelete}
                    variant="danger"
                  >
                    Não
                  </FluencyButton>
                </div>
              ) : (
                <div onClick={() => handleToggle(transaction.id)} className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col w-full justify-between items-center">
                  <p>{transaction.name || "N/A"}</p>
                  <p>{formatDate(transaction.date)}</p>
                  <p className={getTransactionValueColor(transaction.type)}>
                    {formatTransactionValue(transaction.type, transaction.value)}
                  </p>
                  <BsThreeDotsVertical  onClick={() => setIsDeleting(transaction.id)} className="w-4 h-4 cursor-pointer text-black dark:text-white" />
                </div>
              )}

              {/* Slide down the image and extra info if expanded */}
              {expandedTransactionId === transaction.id && (
                <div className="transition-all duration-300 ease-in-out max-h-screen overflow-hidden p-2 mt-4">
                  <p>Tipo de transação: {capitalizeFirstLetter(transaction.type)}</p>
                  <p>Categoria da transação: {capitalizeFirstLetter(transaction.category)}</p>
                  {transaction.receiptUrl && <img
                    width={10} 
                    src={transaction.receiptUrl} 
                    alt={`Image of ${transaction.name}`} 
                    className="w-full h-auto object-cover rounded-md"
                  />}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <FinancialOverview 
        totalIncome={financialData.totalIncome}
        totalExpense={financialData.totalExpense}
        balance={financialData.balance}
        selectedPeriod={`${selectedMonth}/${selectedYear}`}
        itemsListId={filteredTransactions} 
      />
      
    </div>
  );
}
