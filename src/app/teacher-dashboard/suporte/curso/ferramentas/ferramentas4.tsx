export default function Ferramentas4(){
    //Métodos falar a palavra de trás para frente e dividir ela, pedir que o aluno estude todo dia 15min, estudar texto, audio
    return(
        <div>
            <p className='text-2xl font-bold py-2 pb-4'>Métodos</p>
            <div>
                <p className='text-2xl font-bold py-2'>Flashcards</p>
                <p className='py-2'>
                    <strong>O que são</strong>
                    <br />
                    Flashcards são cartões de estudo que contêm uma pergunta de um lado e a resposta do outro. Eles são usados para reforçar a memória e ajudam no aprendizado de novos conceitos, vocabulário, fatos e muito mais.
                </p>
                <p className='py-2'>
                    <strong>Para que servem</strong>
                    <br />
                    Flashcards são uma ferramenta eficaz para memorização e revisão. Eles ajudam a melhorar a retenção de informações e permitem a prática ativa, que é mais eficaz do que a leitura passiva. Eles são especialmente úteis para estudar idiomas, termos técnicos, definições e datas históricas.
                </p>
                <p className='py-2'>
                    <strong>Como usar flashcards</strong>
                    <br />
                    <ul className='list-disc pl-5'>
                        <li>
                            <strong>Criação:</strong> Crie flashcards com uma pergunta ou conceito de um lado e a resposta ou explicação do outro. Você pode fazer isso manualmente em cartões físicos ou usar aplicativos digitais como Anki ou Quizlet.
                        </li>
                        <li>
                            <strong>Revisão Regular:</strong> Revise seus flashcards regularmente. Use a técnica de repetição espaçada para revisar os cartões em intervalos crescentes, o que ajuda a transferir o conhecimento da memória de curto prazo para a de longo prazo.
                        </li>
                        <li>
                            <strong>Categorias:</strong> Organize os flashcards em categorias ou tópicos para facilitar o estudo focado em áreas específicas.
                        </li>
                        <li>
                            <strong>Prática Ativa:</strong> Ao revisar, tente lembrar a resposta antes de virar o cartão. Isso envolve a prática ativa e melhora a retenção.
                        </li>
                        <li>
                            <strong>Avaliação:</strong> Avalie seu desempenho e separe os cartões que você respondeu corretamente dos que teve dificuldade. Concentre-se mais nos cartões que errou.
                        </li>
                        <li>
                            <strong>Adaptar o Conteúdo:</strong> Atualize e adapte seus flashcards conforme necessário. Adicione novos cartões à medida que aprende novos conceitos e remova ou revise cartões que já domina.
                        </li>
                    </ul>
                </p>

                <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                    <p className='w-fit p-6'>Separamos um vídeo que vai te ajudar a montar Flashcards na plataforma.</p>
                    <iframe className='aspect-video w-[65%] rounded-md' src="https://drive.google.com/file/d/15RUaAjbJ3BB-ozF45VG_7_g7_XpZutop/preview" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>

                <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                    <p className='w-fit p-6'>Separamos um vídeo que vai te ajudar a montar Flashcards no aplicativo Anki. <strong className='hover:text-fluency-blue-500'><a href="https://drive.google.com/drive/folders/1LQd6-w6qj9EJ5Eu6rkh4C3tnOx042Lid?usp=drive_link" target='_blank' rel='noopener noreferrer' >Aqui você vai encontrar</a></strong> alguns decks de exemplo.</p>
                    <iframe className='aspect-video w-[65%] rounded-md' src="https://drive.google.com/file/d/1qBq1cJRjkV0krIrZqV9j4qOJPhOwg_VJ/preview" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
                </div>

                <div>
                    <p className='text-2xl font-bold py-2'>Outras sugestões</p>
                    <p className='py-2'>
                        <strong>Estudar todos os dias</strong>
                        <br />
                        Ajude e lembre seu aluno de definir uma meta de estudos diária. Pelo menos 10 minutos todos os dias. Talvez ele possa colocar o celular para despertar ou algum outro tipo de lembrete. Pode ajudar se ele tiver uma programação do que estudar cada dia. 
                    </p>
                </div>

        </div>
    )
}