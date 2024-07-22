export default function Ferramentas2(){
    return(
        <div className="flex flex-col items-center">
            <div className='w-[85vw] flex flex-col items-center rounded-md p-4 my-4 bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                    <p className='text-2xl font-bold py-2'>Perguntas</p>
                <div className="lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start px-4">
                    <p className='w-fit p-6'>Explore a seção de perguntas do FluencyLab, onde você pode solicitar ajuda e interagir com outros professores para esclarecer dúvidas.</p>
                    <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/yvRH8ZQEQ1M?si=uUrwJmB2f08GzUmH" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
            </div>

            <div className='w-[85vw] flex flex-col items-center rounded-md p-4 my-4 bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                    <p className='text-2xl font-bold py-2'>Prática</p>
                <div className="lg:flex lg:flex-row-reverse md:flex md:flex-col flex flex-col gap-1 justify-between items-start px-4">
                    <div className="w-full flex flex-col items-start p-4">
                        <p>A aba de conversas permite criar quizzes e flashcards para alunos, facilitando o aprendizado com feedbacks personalizados.</p>
                        <p>🎮 Análise da aba de conversas</p>
                        <p>📚 Criação de quizzes personalizados</p>
                        <p>✏️ Edição de decks de perguntas</p>
                        <p>✅ Adição de tarefas para alunos</p>
                        <p>🗂️ Flashcards para revisão de vocabulário</p>
                        <p>📊 Feedback adaptativo para alunos</p>
                    </div>

                    <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/Z4AYk15xY7Q?si=-PIi-Elq9VwMd4B2" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
            </div>
        </div>
    )
}