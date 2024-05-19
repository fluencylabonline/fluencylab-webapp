import Link from "next/link";

export default function Dinamica3(){
    return(
        <div>
            <div className='mx-2'>
                <p className='text-xl font-bold py-2 mt-2'>Sobre as remarcações</p>
                <p>Considere os seguintes critérios ao decidir se deve remarcar/repor uma aula. O aluno teve problemas técnicos que impediram o começo da aula? Ou aconteceram mais pro final da aula?</p>
                <p>Conflitos de horário da parte do aluno impossibilitaram que a aula acontecesse? Foi atraso ou o aluno esqueceu? Ele teve um imprevisto sério como doença ou algo familiar?</p>
                <p>Se o aluno não apareceu e nem avisou antes, tem tempo na semana para repor a aula sem atrapalhar sua programação pessoal?</p>
                <p>Avalie cada situação, se comunique bem com o aluno para encontrar a solução adequada. Lembre-se que é responsabilidade do aluno aparecer em cada aula, mas muitas semanas sem estudar podem o desmotivar. Sempre que possível reponha uma aula, ou mande algum tipo de exercício e material, o importante é que o aluno tenha consistencia nos estudos. Como dica, escolha dias específicos para reposição e deixe seus alunos sabendo deles. E sempre que precisar desmarcar uma aula tente avisar com antecedencia e de opções de remarcação quando possível.</p>
            </div>

            <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                <p className='w-fit p-6'>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
        
            <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
            <p>É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>

        </div>
    )
}