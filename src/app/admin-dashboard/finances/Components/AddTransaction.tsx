'use client'
import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase";

import { Toaster, toast } from "react-hot-toast";

import FluencyButton from "@/app/ui/Components/Button/button";
import { IoClose } from "react-icons/io5";

import { Transaction, User } from "./types";
import FluencyInput from "@/app/ui/Components/Input/input";

export default function AddTransaction() {
  const [transaction, setTransaction] = useState<Transaction>({
    date: "",
    type: "entrada",
    category: "mensalidade",
    value: null,
    name: "",
    studentId: "",
  });

  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const db = getFirestore(app);
  const storage = getStorage(app);

  // Fetch students and teachers when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Decide collection based on the category
        const isCancellation = transaction.category === "cancelamento";
        const collectionName = isCancellation ? "past_students" : "users";
  
        // Fetch students
        const studentsQuery = query(
          collection(db, collectionName),
          where("role", "==", "student")
        );
        const studentSnapshot = await getDocs(studentsQuery);
        const studentList = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        })) as User[];
        setStudents(studentList);
  
        // Fetch teachers only when the collection is "users"
        if (!isCancellation) {
          const teachersQuery = query(
            collection(db, "users"),
            where("role", "==", "teacher")
          );
          const teacherSnapshot = await getDocs(teachersQuery);
          const teacherList = teacherSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          })) as User[];
          setTeachers(teacherList);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUsers();
  }, [db, transaction.category]);  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
  
    setTransaction({
      ...transaction,
      [name]: name === "value" ? (value === "" ? null : parseFloat(value.replace(',', '.'))) : value,
    });
  };  

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStudentId = e.target.value;
    const selectedStudent = students.find((student) => student.id === selectedStudentId);

    setTransaction({
      ...transaction,
      name: selectedStudent?.name || "",
      studentId: selectedStudentId, // Save the selected student ID
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

      if (allowedTypes.includes(file.type)) {
        setReceiptFile(file);
        setLoading(false);
      } else {
        toast.error("Invalid file type. Only JPG, PNG, and PDF files are allowed.");
        setLoading(false);
      }
    }
  };

  const handleAddTransaction = async () => {
    try {
      const selectedDate = transaction.date;
      const transactionDate = new Date(`${selectedDate}T00:00:00`);
      const timestamp = Timestamp.fromDate(transactionDate);

      let fileUrl = "";
      if (receiptFile) {
        const storageRef = ref(storage, `receipts/${receiptFile.name}`);
        const snapshot = await uploadBytes(storageRef, receiptFile);
        fileUrl = await getDownloadURL(snapshot.ref);
      }

      const newTransaction = {
        ...transaction,
        date: timestamp,
        receiptUrl: fileUrl,
        studentId: transaction.studentId, // Include the student ID in the transaction
      };

      await addDoc(collection(db, "transactions"), newTransaction);
      toast.success("Transaction added successfully!");

      setTransaction({
        date: "",
        type: "entrada",
        category: "mensalidade",
        value: null,
        name: "",
        studentId: "", // Reset the student ID
      });
      setReceiptFile(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <div>
      <Toaster />
      <FluencyButton variant="gray" className="!w-full" onClick={openModal}>
        Adicionar
      </FluencyButton>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
          <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark w-full max-w-[80vw] min-h-[90vh] max-h-[95vh] rounded-t-2xl p-8 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-center items-center mb-4">
              <h1 className="text-xl font-bold">Adicionar transação</h1>
              <IoClose
                onClick={closeModal}
                className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
              />
            </div>
            <div className="space-y-4">            
              <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center justify-center gap-2">   
                <input
                  type="date"
                  name="date"
                  placeholder="Data"
                  value={transaction.date}
                  onChange={handleInputChange}
                  className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
                />

                <select
                  name="type"
                  value={transaction.type}
                  onChange={handleInputChange}
                  className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
                >
                  <option value="entrada">Entrada</option>
                  <option value="gasto">Gasto</option>
                </select>
                <select
                  name="category"
                  value={transaction.category}
                  onChange={handleInputChange}
                  className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
                >
                  <option value="mensalidade">Mensalidade</option>
                  <option value="despesa">Despesa</option>
                  <option value="professor">Professor</option>
                  <option value="cancelamento">Cancelamento</option>
                </select>
              </div>

              {/* Conditional Select for Students or Teachers based on Category */}
              {(transaction.category === "mensalidade" ||
                transaction.category === "cancelamento") && (
                  <select
                    name="studentId"
                    value={transaction.studentId}
                    onChange={handleStudentChange}
                    className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
              )}

              {transaction.category === "professor" && (
                <select
                  name="name"
                  value={transaction.name}
                  onChange={handleInputChange}
                  className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Input for Name when Category is 'despesa' */}
              {transaction.category === "despesa" && (
                <FluencyInput
                  type="text"
                  name="name"
                  value={transaction.name}
                  onChange={handleInputChange}
                  placeholder="Inserir nome para despesa"
                  className="w-full border p-2 rounded"
                />
              )}

              <input
                type="number"
                name="value"
                value={transaction.value ?? ""} // Use empty string if value is null
                placeholder="R$"
                step="0.01" // Allow decimal input
                onChange={handleInputChange}
                className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
              />

              {/* File Input for Receipt */}
              <div className="mb-4 bg-fluency-pages-light dark:bg-fluency-pages-dark">
                <input type="file" name="file" id="file" className="sr-only" onChange={handleFileChange} />
                <label
                  htmlFor="file"
                  className="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center"
                >
                  <div>
                    <span className="mb-2 block text-xl font-semibold text-black dark:text-white">
                      {receiptFile ? receiptFile.name : "Arraste aqui"}
                    </span>
                    <span className="mb-2 block text-base font-medium text-[#6B7280]">Ou</span>
                    <span className="bg-fluency-bg-light dark:bg-fluency-bg-dark inline-flex rounded border py-2 px-7 text-base font-medium dark:text-white text-black">
                      Procurar
                    </span>
                  </div>
                </label>
              </div>

              {loading && <p className="text-blue-600">Uploading... Please wait.</p>}

            </div>
            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col lg:justify-end md:justify-center justify-center gap-2 mt-4">
              <FluencyButton variant="danger" onClick={closeModal}>
                Cancelar
              </FluencyButton>
              <FluencyButton variant="confirm" onClick={handleAddTransaction}>
                Adicionar
              </FluencyButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
