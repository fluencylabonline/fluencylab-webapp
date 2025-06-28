import { db } from "@/app/firebase";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowBack } from "react-icons/io";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import SpinningLoader from "../../Animations/SpinningComponent";
import { ClipboardPenLine } from "lucide-react";

interface LessonDoc {
  id: string;
  data: DocumentData;
  unit: string;
  workbook: string;
}

interface GroupedLessonDocs {
  unit: string;
  docs: LessonDoc[];
}

interface Workbook {
  id: string;
  title: string;
  level: string;
}

interface WorkbooksProps {
  editor: Editor;
  onClose: any;
  isOpen: any;
}

const levelOrder: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const Workbooks: React.FC<WorkbooksProps> = ({ editor, onClose, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [lessonDocs, setLessonDocs] = useState<
    Record<string, GroupedLessonDocs[]>
  >({});
  const [filteredItems, setFilteredItems] = useState<LessonDoc[]>([]);
  const [expandedWorkbook, setExpandedWorkbook] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<{
    workbook: string;
    unit: string;
  } | null>(null);

  const pasteContentFromFirestore = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
    onClose();
  };

  const fetchWorkbooks = async () => {
    try {
      const workbooksCollection = collection(db, "Apostilas");
      const snapshot = await getDocs(workbooksCollection);
      const fetched: Workbook[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.level) {
          fetched.push({
            id: docSnap.id,
            title: docSnap.id,
            level: data.level,
          });
        }
      });
      setWorkbooks(fetched);
      return fetched;
    } catch (error) {
      console.error("Erro ao buscar apostilas:", error);
      return [];
    }
  };

  const fetchLessonsForWorkbook = async (workbookName: string) => {
    try {
      const lessonsRef = collection(db, `Apostilas/${workbookName}/Lessons`);
      const lessonsSnapshot = await getDocs(lessonsRef);
      const fetchedLessonDocs: LessonDoc[] = lessonsSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          data: doc.data(),
          unit: doc.data().unit || "Uncategorized",
          workbook: workbookName,
        })
      );

      const groupedByUnit: Record<string, LessonDoc[]> =
        fetchedLessonDocs.reduce(
          (acc: Record<string, LessonDoc[]>, doc: LessonDoc) => {
            const unit = doc.unit;
            if (!acc[unit]) acc[unit] = [];
            acc[unit].push(doc);
            return acc;
          },
          {}
        );

      // Sort units by their numerical value if they are numbers
      const sortedUnitGroups = Object.keys(groupedByUnit)
        .sort((a, b) => {
          // Attempt to convert unit names to numbers for sorting
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          // Fallback to string comparison if not purely numerical
          return a.localeCompare(b);
        })
        .map((unit) => ({
          unit,
          docs: groupedByUnit[unit].sort((a, b) => {
            // Extract the leading number from the title for sorting
            const numA = parseInt(a.data.title, 10);
            const numB = parseInt(b.data.title, 10);

            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            // Fallback to string comparison if parsing fails or titles don't start with numbers
            return a.data.title.localeCompare(b.data.title);
          }),
        }));

      return sortedUnitGroups;
    } catch (error) {
      console.error(`Error fetching lessons for ${workbookName}:`, error);
      return [];
    }
  };

  const fetchAllLessons = async () => {
    setLoading(true);
    try {
      const fetchedWorkbooks = await fetchWorkbooks();
      const allLessons: Record<string, GroupedLessonDocs[]> = {};

      for (const workbook of fetchedWorkbooks) {
        const workbookLessons = await fetchLessonsForWorkbook(workbook.id);
        allLessons[workbook.id] = workbookLessons;
      }

      setLessonDocs(allLessons);
    } catch (error) {
      console.error("Error fetching all lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllLessons();
    }
  }, [isOpen]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredItems([]);
      return;
    }

    const lowerValue = value.toLowerCase();
    const results: LessonDoc[] = [];

    Object.entries(lessonDocs).forEach(([workbookName, workbookGroups]) => {
      workbookGroups.forEach((group) => {
        group.docs.forEach((doc) => {
          if (doc.data.title?.toLowerCase().includes(lowerValue)) {
            results.push(doc);
          }
        });
      });
    });

    // Also sort search results by title
    results.sort((a, b) => {
      const numA = parseInt(a.data.title, 10);
      const numB = parseInt(b.data.title, 10);

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.data.title.localeCompare(b.data.title);
    });

    setFilteredItems(results);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredItems([]);
  };

  const toggleWorkbook = (workbookId: string) => {
    setExpandedWorkbook(expandedWorkbook === workbookId ? null : workbookId);
    setExpandedUnit(null);
  };

  const toggleUnit = (workbookId: string, unit: string) => {
    if (expandedUnit?.workbook === workbookId && expandedUnit?.unit === unit) {
      setExpandedUnit(null);
    } else {
      setExpandedUnit({ workbook: workbookId, unit });
    }
  };

  const sortedWorkbooks = [...workbooks].sort(
    (a, b) =>
      levelOrder[a.level as keyof typeof levelOrder] -
      levelOrder[b.level as keyof typeof levelOrder]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
      },
    },
  };

  const lessonVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, height: 0 },
  };

  const renderSearchResults = () => {
    if (filteredItems.length === 0) {
      return (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma lição encontrada
          </p>
        </motion.div>
      );
    }

    return (
      <motion.ul
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredItems.map((doc) => (
          <motion.li
            className="flex flex-row gap-4 justify-between items-center p-4 bg-fluency-pages-light dark:bg-fluency-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            key={`${doc.workbook}-${doc.id}`}
            variants={itemVariants}
          >
            <div className="flex flex-col">
              <p className="text-lg font-semibold">{doc.data.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {doc.workbook} • Unidade {doc.unit}
              </p>
            </div>
            <button
              className="p-2 px-2 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 text-white rounded-md transition-colors"
              onClick={() => pasteContentFromFirestore(doc.data.content)}
            >
              <ClipboardPenLine className="w-4 h-4" />
            </button>
          </motion.li>
        ))}
      </motion.ul>
    );
  };

  const renderWorkbook = (workbook: Workbook) => {
    const isExpanded = expandedWorkbook === workbook.id;
    const workbookLessons = lessonDocs[workbook.id] || [];

    return (
      <motion.div
        className="mb-4 bg-fluency-pages-light dark:bg-fluency-gray-700 rounded-xl overflow-hidden shadow-sm"
        key={workbook.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="w-full flex justify-between items-center p-4 bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700 transition-colors"
          onClick={() => toggleWorkbook(workbook.id)}
        >
          <h3 className="text-lg font-bold">{workbook.title}</h3>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <IoIosArrowDown className="text-xl" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="p-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, height: 0 },
                visible: {
                  opacity: 1,
                  height: "auto",
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {workbookLessons.map((unitGroup, index) => {
                const unitKey = `${workbook.id}-${unitGroup.unit}`;
                const isUnitExpanded =
                  expandedUnit?.workbook === workbook.id &&
                  expandedUnit?.unit === unitGroup.unit;

                return (
                  <motion.div
                    key={unitKey}
                    className="mb-3 last:mb-0"
                    variants={itemVariants}
                  >
                    <button
                      className="w-full flex justify-between items-center p-3 bg-fluency-gray-100 dark:bg-fluency-gray-700 hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-700 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUnit(workbook.id, unitGroup.unit);
                      }}
                    >
                      <h4 className="font-medium">Unidade {unitGroup.unit}</h4>
                      <motion.div
                        animate={{ rotate: isUnitExpanded ? 180 : 0 }}
                      >
                        <IoIosArrowDown className="text-lg" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isUnitExpanded && (
                        <motion.ul
                          className="mt-2 space-y-2"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          {unitGroup.docs.map((doc) => (
                            <motion.li
                              key={doc.id}
                              className="flex justify-between items-center p-3 bg-fluency-gray-300/2 dark:bg-fluency-gray-800 rounded-lg"
                              variants={lessonVariants}
                              whileHover={{ scale: 1.02 }}
                            >
                              <p className="font-medium">{doc.data.title}</p>
                              <button
                                className="p-2 px-2 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 text-white rounded-md transition-colors"
                                onClick={() =>
                                  pasteContentFromFirestore(doc.data.content)
                                }
                              >
                                <ClipboardPenLine className="w-4 h-4" />
                              </button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <motion.div
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <SpinningLoader />
        </motion.div>
      );
    }

    if (searchTerm) {
      return renderSearchResults();
    }

    return (
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedWorkbooks.map((workbook) => renderWorkbook(workbook))}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-50 inset-0 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            ></motion.div>

            <motion.div
              className="relative bg-fluency-pages-light dark:bg-fluency-gray-900 rounded-xl shadow-xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="sticky top-0 z-10 bg-fluency-gray-100 dark:bg-fluency-gray-900 px-10 py-6 shadow-sm">
                <FluencyCloseButton onClick={onClose} />

                <div className="flex justify-center items-center mb-4">
                  <h3 className="text-2xl font-bold">Apostilas</h3>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-fluency-green-500"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={clearSearch}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 pb-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {renderContent()}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Workbooks;