"use client";
import { useSession } from "next-auth/react";
import { Key, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { IoClose, IoMenu } from "react-icons/io5";

interface DetailsModalProps {
    modalId: any;
    onClose: () => void;
    id: any;
}

export function DetailsModal({ id, modalId, onClose }: DetailsModalProps) {
    const { data: session } = useSession();
    const [userId, setUserId] = useState<string>("");
    const [testInfo, setTestInfo] = useState<Record<string, any> | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (session?.user?.role === 'student') {
            setUserId(session.user.id);
        } else (
            setUserId(id)
        )
    }, [session, id]); // Added 'id' to dependency array

    useEffect(() => {
        if (!userId || !modalId) return;

        async function fetchActiveTest() {
            try {
                const placementRef = doc(db, "users", userId, "Placement", modalId);
                const docSnap = await getDoc(placementRef);

                if (docSnap.exists()) {
                    setTestInfo(docSnap.data());
                    setSelectedSection("fala");
                } else {
                    console.log("Nenhum teste ativo encontrado.");
                }
            } catch (err) {
                console.error("Erro ao buscar o teste ativo:", err);
            }
        }

        fetchActiveTest();
    }, [userId, modalId]);

    const renderSectionContent = () => {
        if (!testInfo || !selectedSection) return null;

        switch (selectedSection) {
            case "fala":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">🎤 Fala</h3>
                        {testInfo.speaking && testInfo.speaking.length > 0 ? (
                            testInfo.speaking.map((item: any, index: number) => (
                                <div key={index} className="mb-4 border p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                                    <p className="mb-2">
                                        <strong className="text-indigo-500">Texto {index + 1}:</strong> {item.question?.text}
                                    </p>
                                    <p className="mb-2">
                                        <strong className="text-indigo-500">Resposta:</strong> {item.answer || "Não respondido"}
                                    </p>
                                    <p>
                                        <strong className="text-indigo-500">Pontuação:</strong> {item.score ?? "N/A"}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>Nenhuma questão de fala respondida.</p>
                        )}
                    </section>
                );

            case "vocabulário":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">📚 Vocabulário</h3>
                        {testInfo.vocabulary && testInfo.vocabulary.length > 0 ? (
                            <ul className="list-disc pl-6 space-y-3">
                                {testInfo.vocabulary.map((item: any, index: number) => (
                                    <li key={index} className="border p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                                        <p>
                                            <strong className="text-indigo-500">Palavra:</strong> {item.question?.option}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Resposta:</strong> {item.answer || "Não respondido"}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Pontuação:</strong> {item.score ?? "N/A"}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma questão de vocabulário respondida.</p>
                        )}
                    </section>
                );

            case "gramática":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">🔠 Gramática</h3>
                        {testInfo.grammar && testInfo.grammar.length > 0 ? (
                            <ul className="list-disc pl-6 space-y-3">
                                {testInfo.grammar.map((item: any, index: number) => (
                                    <li key={index} className="border p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                                        <p>
                                            <strong className="text-indigo-500">Palavra:</strong> {item.question?.option}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Resposta:</strong> {item.answer || "Não respondido"}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Pontuação:</strong> {item.score ?? "N/A"}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma questão de gramática respondida.</p>
                        )}
                    </section>
                );

            case "leitura":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">📖 Leitura</h3>
                        {testInfo.reading && testInfo.reading.length > 0 ? (
                            <ul className="list-disc pl-6 space-y-3">
                                {testInfo.reading.map((item: any, index: number) => (
                                    <li key={index} className="border p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                                        <p className="text-justify mb-4">
                                            <strong className="text-indigo-500">Texto:</strong> {item.question?.text}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Pergunta:</strong> {item.question?.question || "Não respondido"}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Resposta:</strong> {item.answer || "Não respondido"}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Pontuação:</strong> {item.score ?? "N/A"}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma questão de leitura respondida.</p>
                        )}
                    </section>
                );

            case "escrita":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">✍️ Escrita</h3>
                        {testInfo.writing && testInfo.writing.length > 0 ? (
                            <ul className="list-disc pl-6 space-y-6">
                                {testInfo.writing.map((item: any, index: number) => (
                                    <li key={index} className="border p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                                        <p>
                                            <strong className="text-indigo-500">Tópico:</strong> {item.question?.topic}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Resposta:</strong> {item.answer || "Não respondido"}
                                        </p>
                                        <div className="flex flex-col gap-1 mt-2 bg-fluency-gray-200 dark:bg-fluency-gray-500 p-2 rounded-md">
                                            <strong className="text-indigo-500 text-lg text-center">Análise:</strong>
                                            {item.analysis ? (
                                                <div className="space-y-1">
                                                    {item.analysis.split('\n').map((line: string, idx: Key | null | undefined) => (
                                                        <p key={idx} className="text-md">
                                                            {line.split('**').map((part, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={idx % 2 === 1 ? "font-semibold text-indigo-500" : ""}
                                                                >
                                                                    {part}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                "Não respondido"
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma questão de escrita respondida.</p>
                        )}
                    </section>
                );

            case "ouvido":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">🎧 Ouvido</h3>
                        {testInfo.listening && testInfo.listening.length > 0 ? (
                            <ul className="list-disc pl-6 space-y-3">
                                {testInfo.listening.map((item: any, index: number) => (
                                    <li key={index} className="border p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
                                        <p className="text-justify mb-4">
                                            <strong className="text-indigo-500">Texto:</strong> {item.question?.text}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Resposta:</strong> {item.answer || "Não respondido"}
                                        </p>
                                        <p>
                                            <strong className="text-indigo-500">Pontuação:</strong> {item.score ?? "N/A"}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma questão de listening respondida.</p>
                        )}
                    </section>
                );

            case "pontuação":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">🏆 Pontuações</h3>
                        <ul className="space-y-2">
                            <li>
                                <strong className="text-indigo-500">Fala:</strong> {testInfo.abilitiesScore?.speakingScore ?? "N/A"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Ouvido:</strong> {testInfo.abilitiesScore?.listeningScore ?? "N/A"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Leitura:</strong> {testInfo.abilitiesScore?.readingScore ?? "N/A"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Escrita:</strong> {testInfo.abilitiesScore?.writingScore ?? "N/A"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Vocabulário:</strong> {testInfo.abilitiesScore?.vocabularyScore ?? "N/A"}
                            </li>
                        </ul>
                    </section>
                );

            case "status":
                return (
                    <section className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">🔍 Status</h3>
                        <ul className="space-y-2">
                            <li>
                                <strong className="text-indigo-500">Fala:</strong> {testInfo.abilitiesCompleted?.speakingCompleted ? "✔️" : "❌"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Ouvido:</strong> {testInfo.abilitiesCompleted?.listeningCompleted ? "✔️" : "❌"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Leitura:</strong> {testInfo.abilitiesCompleted?.readingCompleted ? "✔️" : "❌"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Escrita:</strong> {testInfo.abilitiesCompleted?.writingCompleted ? "✔️" : "❌"}
                            </li>
                            <li>
                                <strong className="text-indigo-500">Vocabulário:</strong> {testInfo.abilitiesCompleted?.vocabularyCompleted ? "✔️" : "❌"}
                            </li>
                        </ul>
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg w-[90%] lg:w-[80%] overflow-hidden">
                <div className="flex justify-between items-center py-3 px-6 bg-fluency-gray-100 dark:bg-fluency-gray-800">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-indigo-500 hover:text-indigo-600 cursor-pointer"
                    >
                        <IoMenu className="w-6 h-6" />
                    </button>
                    <h2 className="lg:text-xl md:text-lg text-sm text-center font-semibold">
                        {testInfo && <>Nivelamento de {testInfo.date}</>}
                    </h2>
                    <IoClose
                        onClick={onClose}
                        className="text-indigo-500 hover:text-indigo-600 cursor-pointer w-7 h-7 ease-in-out duration-300"
                    />
                </div>

                <div>
                    {testInfo ? (
                        <div className="flex h-[70vh]">
                            <aside className={`${isSidebarOpen ? 'lg:w-1/4 md:w-1/4 w-3/4' : 'w-0'} transition-all duration-300 bg-gray-100 dark:bg-gray-800 overflow-y-auto`}>
                                <div className={`p-4 ${!isSidebarOpen && 'hidden'}`}>
                                    <ul className="space-y-2">
                                        {["fala", "vocabulário", "gramática", "leitura", "escrita", "ouvido", "pontuação", "status"].map((section) => (
                                            <li
                                                key={section}
                                                onClick={() => setSelectedSection(section)}
                                                className={`cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${selectedSection === section ? "font-bold text-indigo-600 bg-gray-200 dark:bg-gray-700" : ""
                                                    }`}
                                            >
                                                {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </aside>

                            <div className={`${isSidebarOpen ? 'w-3/4' : 'w-full'} transition-all duration-300 pl-4 overflow-y-auto p-8`}>
                                {renderSectionContent()}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}