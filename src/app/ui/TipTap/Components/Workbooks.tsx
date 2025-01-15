import { db } from "@/app/firebase";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { collection, QuerySnapshot, DocumentData, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowBack } from "react-icons/io";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { Editor } from '@tiptap/react';

    interface LessonDoc {
        id: string;
        data: DocumentData;
        unit: string;
    }

    interface GroupedLessonDocs {
        unit: string;
        docs: LessonDoc[];
    }

    interface WorkbooksProps {
        editor: Editor;
        onClose: any;
        isOpen: any;
    }

const Workbooks: React.FC<WorkbooksProps> = ({ editor, onClose, isOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    type GroupedLessonDocsMap = { [key: string]: GroupedLessonDocs[] };
    const [lessonDocs, setLessonDocs] = useState<GroupedLessonDocsMap>({});

    const pasteContentFromFirestore = (content: string) => {
        if (editor) {
        editor.chain().focus().insertContent(content).run();
        }
        onClose()
    };

    const fetchDocs = async () => {
      const workbookNames = ['First Steps', 'The Basics', 'All you need to know', 'Traveling', 'Instrumental'];
      const groupedLessons: GroupedLessonDocsMap = {};
    
      try {
        for (const workbookName of workbookNames) {
          const lessonsRef = collection(db, 'Notebooks', workbookName, 'Lessons');
          const lessonsSnapshot: QuerySnapshot<DocumentData> = await getDocs(lessonsRef);
          const fetchedLessonDocs: LessonDoc[] = lessonsSnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
            unit: doc.data().unit || 'Uncategorized',
          }));

          const groupedByUnit: { [key: string]: LessonDoc[] } = fetchedLessonDocs.reduce((acc: { [key: string]: LessonDoc[] }, doc: LessonDoc) => {
            const unit = doc.unit;
            if (!acc[unit]) {
              acc[unit] = [];
            }
            acc[unit].push(doc);
            return acc;
          }, {});

          const groupedLessonDocs: GroupedLessonDocs[] = Object.keys(groupedByUnit).map(unit => ({
            unit,
            docs: groupedByUnit[unit],
          }));
    
          groupedLessons[workbookName] = groupedLessonDocs;
        }
    
        setLessonDocs(groupedLessons);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };
  
    useEffect(() => {
      fetchDocs();
    }, []);
  
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value.toLowerCase());
    };
  
    const filteredItems = Object.keys(lessonDocs).flatMap(workbookName => {
      return lessonDocs[workbookName].flatMap(group => {
        return group.docs.filter(doc => {
          const title = doc.data?.title;
          return typeof title === 'string' && title.toLowerCase().includes(searchTerm);
        });
      });
    });  
  
    const renderItems = () => {
      return (
        <ul className='flex flex-col gap-1'>
          {filteredItems.map(doc => (
            <li className='flex flex-row gap-2 justify-between items-center' key={doc.id}>
              <p className='text-lg font-semibold'>{doc.data.title} de <span className='font-bold'>{doc.data.workbook}</span></p>
              <button className='p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 duration-300 ease-in-out text-white dark:text-white font-semibold rounded-md' onClick={() => pasteContentFromFirestore(doc.data.content)}>
                Colar
              </button>
            </li>
          ))}
        </ul>
      );
    };
  
    const renderAccordion = () => {
      return (
        <Accordion>
          {Object.keys(lessonDocs).map((workbookName, workbookIndex) => (
            <AccordionItem
              className='font-semibold w-full text-xl'
              key={workbookIndex}
              aria-label={workbookName}
              title={workbookName}
              indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
            >
              <div className="mt-2 flex flex-col items-center gap-3 p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                <p className='font-bold text-xl'>{workbookName}</p>
                <Accordion>
                  {lessonDocs[workbookName].map((group, groupIndex) => (
                    <AccordionItem
                      className='font-semibold w-full text-xl'
                      key={groupIndex}
                      aria-label={`Unidade ${groupIndex + 1}`}
                      title={`Unidade ${groupIndex + 1}`}
                      indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                    >
                      <ul className='flex flex-col gap-1'>
                        {group.docs.map(doc => (
                          <li className='flex flex-row gap-2 justify-between items-center' key={doc.id}>
                            <p className='text-lg font-bold'>{doc.data.title}</p>
                            <button className='p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 duration-300 ease-in-out text-white dark:text-white font-semibold rounded-md' onClick={() => pasteContentFromFirestore(doc.data.content)}>
                              Colar
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      );
    };

    if (!isOpen) return null;

    return(
        <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-[80vw] h-[80vh] overflow-y-scroll p-4">
                    <div className="flex flex-col items-center justify-center">
                      <FluencyCloseButton onClick={onClose} />
                      <h3 className="text-2xl font-bold leading-6 mb-2">Apostilas</h3>
                      <input
                          type="text"
                          placeholder="Buscar por título..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="mb-4 p-2 border border-gray-300 rounded bg-fluency-pages-light dark:bg-fluency-pages-dark text-black dark:text-white"
                      />
                      {searchTerm ? renderItems() : renderAccordion()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Workbooks;