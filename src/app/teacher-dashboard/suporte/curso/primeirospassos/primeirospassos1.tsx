import Link from "next/link";

export default function PrimeirosPassos1(){
    return(
        <div>
            <p className='text-2xl font-bold py-2'>Introdução</p>
                    <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material de apoio</Link></strong> extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                    <p>Ah! E fique à vontade para dar sugestões sobre o que seria interessante ter por aqui.</p>
                    <p>Vamos lá! É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>
                    <p>Nossa ideia é fazer com que os alunos aproveitem bem cada aula e sintam que tem suporte para continuar estudando durante a semana. Nossos alunos são muito variados e tem necessidades muito diferentes. Por isso, é muito importante sempre manter uma boa conversa sobre o que eles acham do curso, o que eles aproveitam e o que não aproveitam.</p>

                    <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                        <p className='w-fit p-6'>Para não te entediar muito, preparamos um vídeo curto com informações importantes. Fique a vontade para tirar suas dúvidas.</p>
                        <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>

                    <p>Agora você tem uma ideia boa do que nós tentamos realizar na FluencyLab. Sinta-se sempre a vontade para tirar suas dúvidas e pedir ajuda. Queremos que os professores sintam nosso apoio tanto quanto os alunos!</p>                

        </div>
    )
}