import Link from "next/link";

export default function Dinamica2(){
    return(
        <div>
            <div className='mx-2'>
                <p className='text-2xl font-bold py-2'>O que levar em conta nas aulas</p>
                <p>É interessante que cada aula tenha materiais, métodos e ferramentas que o aluno goste e aproveite mais. Como músicas, trechos de séries ou filmes, livros, jogos ou dinânicas e assim por diante.</p>
                <p>Sempre dê um feedback contínuo para seus alunos, mostre onde ele já melhorou e como, e o ajude a perceber o que ele ainda precisa melhorar. Mantenha um equilíbrio entre a cobrança e os elogios para que o aluno possa continuar motivado. </p>
                <p>Crie metas realistas para o aluno, ajude ele a atingir cada uma delas progressivamente. Peça feedbacks do aluno para que você possa saber como suas próprias aulas estão, e sempre seja aberto a sugestões e até críticas do aluno. Elas podem tornar suas aulas mais úteis e interessantes. Incentive seu aluno a usar o idioma desde a primeira aula, o ajude a ver onde ele pode usar já no começo. Seja encorajador, e incentivando o aluno a se expressar e praticar o idioma.</p>
                <p>Defina alguns dias que pode ficar disponível para tirar dúvidas rápidas do aluno por meio de mensagem, e se a dúvida for complexa anote para a aula seguinte.</p>
                <p>Fique atento ao progresso do aluno e ajuste seus métodos, ferramentas e estratégias de necessário. As situações de cada aluno podem mudar, e mudamos junto com elas. </p>
                <p>Mantenha uma boa comunicação com o aluno e responsável se ele tiver um para conseguir fornecer informações e atualizações sobre o progresso do aluno.</p>
                <p>Tente criar um vínculo com seus alunos, pergunte sobre a semana ou o dia. Sobre o que gostam e o que acham interessante, isso pode motivar o aluno a estudar mais e ficar mais animado para cada aula. </p>
            </div>
        
            <div className='w-full lg:flex lg:flex-row-reverse md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                <p className='w-fit p-6'>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
        </div>
    )
}