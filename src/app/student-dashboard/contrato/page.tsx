'use client';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, query, collection, orderBy, limit, getDocs } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyButton from '@/app/ui/Components/Button/button';
import { FaSignature } from 'react-icons/fa6';
import ReactToPrint from 'react-to-print';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { montserrat, myFont } from '@/app/ui/Fonts/fonts';
import './contrato.css';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface InnerFormProps {
    contractData: any;
}

const InnerForm = React.forwardRef<HTMLDivElement, InnerFormProps>(({contractData}, ref) => {
    const { data: session } = useSession();
    return (
        <div className={`${montserrat.className} antialiased w-full h-full flex flex-col justify-between text-black dark:text-black`} ref={ref}>
            <div id='pagina1' className='min-w-[210mm] max-w-[210mm] min-h-[297mm] max-h-[297mm] flex flex-col items-center justify-between bg-white dark:bg-white'>
            <div className='flex flex-col items-center gap-2 p-5'>
                <h1 className='text-2xl font-bold mb-3 mx-4 text-center'>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>CONTRATANTE:</span> {contractData?.name}, devidamente inscrito no CPF sob o nº {contractData?.cpf}.</p>
                    <p><span className='font-bold'>CONTRATADA:</span> Fluency Lab, com sede na Rua Vinte e Cinco de Julho, 20. Bairro Centro, Tunápolis - SC, inscrita no CNPJ sob nº 47.603.142/0001-07, neste ato representado por Matheus de Souza Fernandes, brasileiro, casado, empresário, carteira de identidade nº 706.251.811-58, CPF nº 706.251.811-58, residente e domiciliado à na Rua Vinte e Cinco de Julho, 20. Bairro Centro, Tunápolis - SC.</p>
                    <p>As partes acima acordam com o presente Contrato de Prestação de Serviços Educacionais, que se regerá pelas cláusulas seguintes: </p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 1ª.</span> O OBJETO do presente instrumento é a prestação de serviços educacionais - aulas particulares de idioma, reforço escolar, acompanhamento escolar e demais atividades - voltadas às necessidades do CONTRATANTE.</p>
                    <p><span className='font-bold'>Parágrafo Primeiro:</span> O Objeto específico deste contrato em particular é a prestação de serviço de aulas de idioma, escolhidas pelo CONTRATANTE na etapa de agendamento, e serão ministradas de forma semanal, na quantidade de vezes por semana escolhidas pelo CONTRATANTE, no horário escolhido pelo CONTRATANTE.</p>
                    <p><span className='font-bold'>Parágrafo Segundo:</span> todas as aulas serão ministradas de forma remota, on-line, por meio de programa a ser definido entre as partes.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 2ª.</span> Está obrigada a CONTRATADA em fornecer ao aluno, o serviço de aulas particulares informado na etapa de agendamento, conforme descrito no Parágrafo único da Cláusula 1ª.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 3ª.</span> Está obrigado o CONTRATANTE em trazer para as aulas o material - livro, apostila, exercícios, etc. - cujo estudo esteja sendo realizado, cumprir com os horários e atividades extracurriculares.</p>
                    <p><span className='font-bold'>Parágrafo único.</span> Em caso de não cumprimento desta cláusula a CONTRATADA não se responsabiliza pelo andamento e qualidade da aula.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 4ª.</span> É obrigação do CONTRATANTE, efetuar o pagamento para a CONTRATADA, da quantia referente ao pacote de aulas selecionado.</p>
                    <p><span className='font-bold'>Cláusula 5ª.</span> O pagamento deverá ser realizado no ato da contratação, por meio de débito, crédito ou transferência bancária.</p>
                    <p><span className='font-bold'>Parágrafo único.</span> O pagamento deve ser realizado mensalmente, entre os dias 1º e 10º de cada mês, durante o período de validade deste contrato.</p>
                    <p><span className='font-bold'>Parágrafo único.</span> Reajuste Anual: Uma vez por ano, no mês de julho, a mensalidade do contrato será sujeita a um reajuste de preço. O reajuste será calculado com base em índices econômicos relevantes e de acordo com as variações de mercado ocorridas desde o último reajuste. A CONTRATANTE será devidamente informada sobre o reajuste de preço com no mínimo um mês de antecedência à data efetiva do reajuste. A notificação será enviada por escrito, por meio de comunicação eletrônica, especificando a nova mensalidade calculada após o reajuste.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 6ª.</span> O horário e regularidade semanal das aulas deve ser escolhida pelo CONTRATANTE de acordo com a disponibilidade. Todas as especificações da aula como: data, horário de início da aula e duração da aula, devem constar no formulário de agendamento.</p>
                    <p><span className='font-bold'>Parágrafo Único.</span> O não cumprimento da Cláusula 6ª pode acarretar em um atraso no agendamento da aula.</p>
                    <p><span className='font-bold'>Cláusula 7ª.</span> A marcação das aulas está diretamente vinculada à disponibilidade de horário dos professores/instrutores. Caso não haja essa disponibilidade do horário escolhido, o CONTRATANTE deverá escolher uma nova data para as aulas.</p>
                    <p><span className='font-bold'>Parágrafo Único.</span> A preferência na disponibilidade do horário será dada pela ordem de recebimento dos pedidos de agendamento.</p>
                    <p><span className='font-bold'>Cláusula 8ª.</span> Está obrigada a CONTRATADA a efetuar a marcação e agendamento das aulas em até 48 - quarenta e oito - horas após o recebimento do pedido.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 9ª.</span> O CONTRATANTE se responsabiliza a proporcionar um ambiente adequado para as aulas, tratando com devido respeito o professor/instrutor designado à aula.</p>
                    <p><span className='font-bold'>Parágrafo Único.</span> Em caso de não cumprimento da Cláusula 9ª, a CONTRATADA não se responsabiliza pelo andamento e qualidade da aula.</p>
                    <p><span className='font-bold'>Cláusula 10ª.</span> A CONTRATADA se responsabiliza a proporcionar um ambiente adequado para as aulas, tratando com o devido respeito o aluno designado para a aula.</p>
                    <p><span className='font-bold'>Cláusula 11ª.</span> As aulas serão realizadas através de videoconferência entre o professor/instrutor e o aluno.</p>
                    <p><span className='font-bold'>Parágrafo Único.</span> Poderá haver mais de um instrutor/professor na aula com o aluno.</p>
                    <p><span className='font-bold'>Cláusula 12ª.</span> A CONTRATADA não se responsabiliza pela qualidade da aula caso o CONTRATANTE não mantenha o ambiente de aula adequado para tal.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 13ª.</span> As aulas poderão ser remarcadas ou repostas tanto pelo CONTRATANTE quanto pela CONTRATADA uma vez por mês, contudo, a mesma deve ocorrer mediante um aviso prévio de no mínimo 1 - um - dia.</p>
                    <p><span className='font-bold'>Parágrafo único.</span> O CONTRATADO não tem a obrigação de avisar ou relembrar o aluno a respeito do horário de aula.</p>
                    <p><span className='font-bold'>Parágrafo único.</span> A CONTRATADA dará margem de 15 minutos de atraso para o CONTRATANTE, após esse tempo a CONTRATADA não tem mais obrigação de continuar, remarcar ou repor a aula daquele dia.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 14ª.</span> Este CONTRATO pode ser rescindido por qualquer das partes havendo aviso prévio de 15 dias úteis à parte contrária.</p>
                    <p><span className='font-bold'>Cláusula 15ª.</span> Pode a CONTRATADA rescindir o presente contrato, após reunião interna do conselho, por indisciplina do aluno representado neste instrumento.</p>
                    <p><span className='font-bold'>Cláusula 16ª.</span> Ocorrendo a rescisão, o aluno será desligado da Fluency Lab imediatamente.</p>
                    <p><span className='font-bold'>Cláusula 17ª.</span> Ocorrendo rescisão por parte do CONTRATANTE, ele pagará uma taxa de 50% do valor total da mensalidade seguinte.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 18ª.</span> Este contrato tem duração de 06 meses, contando-se a partir da efetivação da compra e podendo ser prorrogado por comum acordo de ambas as partes.</p>
                </div>
                <div className='flex flex-col text-justify gap-3'>
                    <p><span className='font-bold'>Cláusula 19ª.</span> Fica condicionada a validade deste contrato à matrícula regular do aluno.</p>
                    <p><span className='font-bold'>Cláusula 20ª.</span> A não frequência do aluno nas aulas não exime a CONTRATANTE do pagamento da aula à CONTRATADA.</p>
                    <p><span className='font-bold'>Cláusula 21ª.</span> A CONTRATADA se coloca no direito a três semanas de recesso durante o ano, podendo elas serem tiradas seguidas ou divididas em 1 semana cada. Não interferindo no pagamento mensal das aulas.</p>
                    <p><span className='font-bold'>Parágrafo único.</span> A CONTRATADA é obrigada a avisar com antecedência de 1 mês a respeito do recesso e fornecer conteúdo para todos os alunos durante o período de recesso.</p>
                </div>
                <div className='flex flex-col items-center justify-center gap-4 w-full mt-12'>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <div>Tunápolis - SC, {contractData?.formattedDate}</div>
                    </div>
                    <div className='flex flex-row gap-1 w-full justify-around'>
                        <div className={`${myFont.className} antialiased`}><p className='w-fit border-black border-b-[1px] text-xl'>{contractData?.name}</p></div>
                        <div className={`${myFont.className} antialiased`}><p className='w-fit border-black border-b-[1px] text-xl'>Matheus de Souza Fernandes</p></div>
                    </div>
                </div>
                </div>
            </div>
            <div className='relative top-44 flex flex-col items-center gap-2 p-12 bg-fluency-gray-100 rounded-md'>
                <h1 className='text-2xl font-bold mb-3 text-center'>Audit Log</h1>
                <div className='flex flex-col gap-2 items-start justify-center'>
                    <p><span className='font-bold'>ID:</span> {contractData?.logID}</p>
                    <div className='p-1'>
                        <p className='font-bold'>Informações do signatário:</p>
                        <p><span className='font-bold'>Nome:</span> {contractData?.name}</p>
                        <p><span className='font-bold'>CPF:</span> {contractData?.cpf}</p>
                        <p><span className='font-bold'>Email:</span> {session?.user.email}</p>
                    </div>
                    <div className='p-1'>
                        <p className='font-bold'>Assinatura:</p>
                        <p className={`${myFont.className} antialiased`}>{contractData?.name}</p>
                    </div>
                    <div className='p-1'>
                        <p className='font-bold'>Acesso:</p>
                        <div className='flex flex-col items-start gap-2'>
                            <span className='font-bold'>IP:</span> {contractData.ip}
                            <span className='font-bold'>Navegador:</span> {contractData.browser}
                        </div>
                        <p><span className='font-bold'>Contrato assinado em:</span> {contractData.signedAt}</p>
                        <p><span className='font-bold'>Contrato visualizado em:</span> {contractData.viewedAt}</p>
                        <p><span className='font-bold'>Concordou com os termos do contrato:</span> {contractData.agreedToTerms}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});
InnerForm.displayName = 'InnerForm';

export default function ContratoAluno() {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        cpf: '',
        name: '',
        birthDate: '',
        ip: '',
        viewedAt: '',
        signedAt: '',
        agreedToTerms: false,
        browser: '',
    });

    const [meioPagamento, setMeioPagamento] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contratoFoiAssinado, setContratoFoiAssinado] = useState<{ 
        signed: boolean; 
        logs: { logID: string; signedAt: string; segundaParteAssinou: boolean }[] 
    } | null>(null);
    
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (session && session.user && session.user.id) {
                try {
                    const profile = doc(db, 'users', session.user.id);
                    const docSnap = await getDoc(profile);
                    if (docSnap.exists()) {
                        setName(docSnap.data().name);
                        setEmail(docSnap.data().email);
                        setContratoFoiAssinado(docSnap.data().ContratoAssinado || { signed: false, logs: [] });
                        setMeioPagamento(docSnap.data().meioPagamento);
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching document: ", error);
                }
            }
        };

        fetchUserInfo();
    }, [session]);  
    
    // Fetch IP and Browser
    useEffect(() => {
        const fetchIpAndBrowser = async () => {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const browser = navigator.userAgent;
            setFormData((prevData) => ({ ...prevData, ip: data.ip, browser }));
        };

        fetchIpAndBrowser();
    }, []);

    useEffect(() => {
        setFormData((prevData) => ({ ...prevData, viewedAt: new Date().toLocaleString() }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!formData.agreedToTerms) {
            toast.error('Você deve concordar com os termos e condições para continuar!', {
                position: 'top-center',
                duration: 2000,
              });
            return;
        }
    
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // Extract only the date part
        const logID = uuidv4(); // Generate unique log ID
        const dataToSubmit = { 
            ...formData, 
            signedAt: now.toISOString(),
            formattedDate: format(now, "dd 'de' MMMM 'de' yyyy", { locale: pt }),
            logID 
        };
        
        // Check if 'meioPagamento' is 'cartao' before routing
        if (meioPagamento === 'cartao') {
            router.push('/student-dashboard/pagamento');
        }
    
        if (session && session.user && session.user.id) {
            const userId = session.user.id;
            const userDocRef = doc(db, 'users', userId);
            const contractDocRef = doc(db, 'users', userId, 'Contrato', currentDate);
    
            try {
                // Check if a contract document for the current date already exists
                const contractSnapshot = await getDoc(contractDocRef);
                if (contractSnapshot.exists()) {
                    toast.error('Um contrato para essa data já existe!', {
                        position: 'top-center',
                        duration: 2000,
                      });
                    return;
                }
    
                // Create new contract document
                await setDoc(contractDocRef, dataToSubmit);
    
                const newLog = {
                    logID,
                    signedAt: now.toISOString(),
                    segundaParteAssinou: false,
                };
    
                // Update user document with the new log
                await updateDoc(userDocRef, {
                    'ContratoAssinado.signed': true,
                    'ContratoAssinado.logs': arrayUnion(newLog),
                });
    
                toast.success('Contrato assinado com sucesso!', {
                    position: 'top-center',
                    duration: 2000,
                  });
                setContratoFoiAssinado((prev) => ({
                    signed: true,
                    logs: [...(prev?.logs || []), newLog],
                }));
            } catch (error) {
                console.error("Error saving contract: ", error);
                alert('Falha ao salvar o contrato.');
            }
        }
    };
    
    const [signing, setSigning] = useState(false);
    function openSigning(){
        setSigning(true)
    }
    function closeSigning(){
        setSigning(false)
    }

    const componentRef = useRef<HTMLDivElement>(null);
    const [contractData, setContractData] = useState<any>(null); // Adjust the type as per your contract data structure
    useEffect(() => {
        const fetchContractData = async () => {
            if (session && session.user && session.user.id) {
                try {
                    const userId = session.user.id;
                    const userContractRef = collection(db, 'users', userId, 'Contrato');
                    const querySnapshot = await getDocs(userContractRef);
    
                    if (!querySnapshot.empty) {
                        let latestContract: any = null; // Explicitly set the type to 'any'
                        querySnapshot.forEach(doc => {
                            const contractData = doc.data();
                            if (!latestContract || contractData.date > latestContract.date) {
                                latestContract = contractData;
                            }
                        });
    
                        if (latestContract) {
                            setContractData(latestContract);
                            console.log(latestContract.name, latestContract.signedAt);
                        } else {
                            console.log("No contract data found for the user.");
                        }
                    } else {
                        console.log("No contracts found for the user.");
                    }
                } catch (error) {
                    console.error("Error fetching contract data: ", error);
                }
            }
        };
        fetchContractData();
    }, [session]);
    
    return (
        <div className='p-4'>
            {contratoFoiAssinado?.signed ? (
                <div className='min-h-[85vh] w-full flex flex-row items-center justify-center'>
                    <ul>
                        <li className='flex flex-col items-center justify-center gap-4 w-max bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-md' key={contratoFoiAssinado.logs[contratoFoiAssinado.logs.length - 1].logID}>
                        <p className='font-bold'>Contrato assinado em:</p> 
                        <span>
                            {new Date(contratoFoiAssinado.logs[contratoFoiAssinado.logs.length - 1].signedAt)
                                .toLocaleDateString('pt-BR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                        </span>
                            <ReactToPrint
                                trigger={() => {
                                    return <FluencyButton variant='danger'>Baixar Contrato</FluencyButton>;
                                }}
                                content={() => componentRef.current}
                                documentTitle='Contrato de Aulas'
                                pageStyle="print"
                            />
                            <div className='hidden'><InnerForm ref={componentRef} contractData={contractData}/></div>
                        </li>
                    </ul>
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center w-full'>
                    <h1 className='text-2xl font-bold'>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
                    <div className='flex flex-col w-full gap-2 px-8 py-4'>

                        <Accordion>
                        <AccordionItem
                            key={1}
                            aria-label="DAS PARTES"
                            title="DAS PARTES"
                            indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                        >
                            <div className='flex flex-col text-justify gap-3'>
                                <p><span className='font-bold'>CONTRATANTE:</span> _______________, devidamente inscrito no CPF sob o nº _______________.</p>
                                <p><span className='font-bold'>CONTRATADA:</span> Fluency Lab, com sede na Rua Vinte e Cinco de Julho, 20. Bairro Centro, Tunápolis - SC, inscrita no CNPJ sob nº 47.603.142/0001-07, neste ato representado por Matheus de Souza Fernandes, brasileiro, casado, empresário, carteira de identidade nº 706.251.811-58, CPF nº 706.251.811-58, residente e domiciliado à na Rua Vinte e Cinco de Julho, 20. Bairro Centro, Tunápolis - SC.</p>
                                <p>As partes acima acordam com o presente Contrato de Prestação de Serviços Educacionais, que se regerá pelas cláusulas seguintes: </p>
                            </div>

                                </AccordionItem>
                                    <AccordionItem
                                        key={2}
                                        aria-label="DO OBJETO DO CONTRATO"
                                        title="DO OBJETO DO CONTRATO"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 1ª.</span> O OBJETO do presente instrumento é a prestação de serviços educacionais - aulas particulares de idioma, reforço escolar, acompanhamento escolar e demais atividades - voltadas às necessidades do CONTRATANTE.</p>
                                            <p><span className='font-bold'>Parágrafo Primeiro:</span> O Objeto específico deste contrato em particular é a prestação de serviço de aulas de idioma, escolhidas pelo CONTRATANTE na etapa de agendamento, e serão ministradas de forma semanal, na quantidade de vezes por semana escolhidas pelo CONTRATANTE, no horário escolhido pelo CONTRATANTE.</p>
                                            <p><span className='font-bold'>Parágrafo Segundo:</span> todas as aulas serão ministradas de forma remota, on-line, por meio de programa a ser definido entre as partes.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={3}
                                        aria-label="DA OBRIGAÇÃO DA CONTRATADA"
                                        title="DA OBRIGAÇÃO DA CONTRATADA"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 2ª.</span> Está obrigada a CONTRATADA em fornecer ao aluno, o serviço de aulas particulares informado na etapa de agendamento, conforme descrito no Parágrafo único da Cláusula 1ª.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={4}
                                        aria-label="DA OBRIGAÇÃO DO CONTRATANTE"
                                        title="DA OBRIGAÇÃO DO CONTRATANTE"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 3ª.</span> Está obrigado o CONTRATANTE em trazer para as aulas o material - livro, apostila, exercícios, etc. - cujo estudo esteja sendo realizado, cumprir com os horários e atividades extracurriculares.</p>
                                            <p><span className='font-bold'>Parágrafo único.</span> Em caso de não cumprimento desta cláusula a CONTRATADA não se responsabiliza pelo andamento e qualidade da aula.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={5}
                                        aria-label="DO PAGAMENTO"
                                        title="DO PAGAMENTO"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 4ª.</span> É obrigação do CONTRATANTE, efetuar o pagamento para a CONTRATADA, da quantia referente ao pacote de aulas selecionado.</p>
                                            <p><span className='font-bold'>Cláusula 5ª.</span> O pagamento deverá ser realizado no ato da contratação, por meio de débito, crédito ou transferência bancária.</p>
                                            <p><span className='font-bold'>Parágrafo único.</span> O pagamento deve ser realizado mensalmente, entre os dias 1º e 10º de cada mês, durante o período de validade deste contrato.</p>
                                            <p><span className='font-bold'>Parágrafo único.</span> Reajuste Anual: Uma vez por ano, no mês de julho, a mensalidade do contrato será sujeita a um reajuste de preço. O reajuste será calculado com base em índices econômicos relevantes e de acordo com as variações de mercado ocorridas desde o último reajuste. A CONTRATANTE será devidamente informada sobre o reajuste de preço com no mínimo um mês de antecedência à data efetiva do reajuste. A notificação será enviada por escrito, por meio de comunicação eletrônica, especificando a nova mensalidade calculada após o reajuste.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={6}
                                        aria-label="DA MARCAÇÃO DAS AULAS"
                                        title="DA MARCAÇÃO DAS AULAS"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 6ª.</span> O horário e regularidade semanal das aulas deve ser escolhida pelo CONTRATANTE de acordo com a disponibilidade. Todas as especificações da aula como: data, horário de início da aula e duração da aula, devem constar no formulário de agendamento.</p>
                                            <p><span className='font-bold'>Parágrafo Único.</span> O não cumprimento da Cláusula 6ª pode acarretar em um atraso no agendamento da aula.</p>
                                            <p><span className='font-bold'>Cláusula 7ª.</span> A marcação das aulas está diretamente vinculada à disponibilidade de horário dos professores/instrutores. Caso não haja essa disponibilidade do horário escolhido, o CONTRATANTE deverá escolher uma nova data para as aulas.</p>
                                            <p><span className='font-bold'>Parágrafo Único.</span> A preferência na disponibilidade do horário será dada pela ordem de recebimento dos pedidos de agendamento.</p>
                                            <p><span className='font-bold'>Cláusula 8ª.</span> Está obrigada a CONTRATADA a efetuar a marcação e agendamento das aulas em até 48 - quarenta e oito - horas após o recebimento do pedido.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={7}
                                        aria-label="DO DECORRER DAS AULAS"
                                        title="DO DECORRER DAS AULAS"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 9ª.</span> O CONTRATANTE se responsabiliza a proporcionar um ambiente adequado para as aulas, tratando com devido respeito o professor/instrutor designado à aula.</p>
                                            <p><span className='font-bold'>Parágrafo Único.</span> Em caso de não cumprimento da Cláusula 9ª, a CONTRATADA não se responsabiliza pelo andamento e qualidade da aula.</p>
                                            <p><span className='font-bold'>Cláusula 10ª.</span> A CONTRATADA se responsabiliza a proporcionar um ambiente adequado para as aulas, tratando com o devido respeito o aluno designado para a aula.</p>
                                            <p><span className='font-bold'>Cláusula 11ª.</span> As aulas serão realizadas através de videoconferência entre o professor/instrutor e o aluno.</p>
                                            <p><span className='font-bold'>Parágrafo Único.</span> Poderá haver mais de um instrutor/professor na aula com o aluno.</p>
                                            <p><span className='font-bold'>Cláusula 12ª.</span> A CONTRATADA não se responsabiliza pela qualidade da aula caso o CONTRATANTE não mantenha o ambiente de aula adequado para tal.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={8}
                                        aria-label="DA REMARCAÇÃO DAS AULAS"
                                        title="DA REMARCAÇÃO DAS AULAS"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 13ª.</span> As aulas poderão ser remarcadas ou repostas tanto pelo CONTRATANTE quanto pela CONTRATADA uma vez por mês, contudo, a mesma deve ocorrer mediante um aviso prévio de no mínimo 1 - um - dia.</p>
                                            <p><span className='font-bold'>Parágrafo único.</span> O CONTRATADO não tem a obrigação de avisar ou relembrar o aluno a respeito do horário de aula.</p>
                                            <p><span className='font-bold'>Parágrafo único.</span> A CONTRATADA dará margem de 15 minutos de atraso para o CONTRATANTE, após esse tempo a CONTRATADA não tem mais obrigação de continuar, remarcar ou repor a aula daquele dia.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={9}
                                        aria-label="DA RESCISÃO"
                                        title="DA RESCISÃO"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 14ª.</span> Este CONTRATO pode ser rescindido por qualquer das partes havendo aviso prévio de 15 dias úteis à parte contrária.</p>
                                            <p><span className='font-bold'>Cláusula 15ª.</span> Pode a CONTRATADA rescindir o presente contrato, após reunião interna do conselho, por indisciplina do aluno representado neste instrumento.</p>
                                            <p><span className='font-bold'>Cláusula 16ª.</span> Ocorrendo a rescisão, o aluno será desligado da Fluency Lab imediatamente.</p>
                                            <p><span className='font-bold'>Cláusula 17ª.</span> Ocorrendo rescisão por parte do CONTRATANTE, ele pagará uma taxa de 50% do valor total da mensalidade seguinte.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={10}
                                        aria-label="DO PRAZO"
                                        title="DO PRAZO"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 18ª.</span> Este contrato tem duração de 06 meses, contando-se a partir da efetivação da compra e podendo ser prorrogado por comum acordo de ambas as partes.</p>
                                        </div>
                                    </AccordionItem>

                                    <AccordionItem
                                        key={11}
                                        aria-label="CONDIÇÕES GERAIS"
                                        title="CONDIÇÕES GERAIS"
                                        indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                                    >
                                        <div className='flex flex-col text-justify gap-3'>
                                            <p><span className='font-bold'>Cláusula 19ª.</span> Fica condicionada a validade deste contrato à matrícula regular do aluno.</p>
                                            <p><span className='font-bold'>Cláusula 20ª.</span> A não frequência do aluno nas aulas não exime a CONTRATANTE do pagamento da aula à CONTRATADA.</p>
                                            <p><span className='font-bold'>Cláusula 21ª.</span> A CONTRATADA se coloca no direito a três semanas de recesso durante o ano, podendo elas serem tiradas seguidas ou divididas em 1 semana cada. Não interferindo no pagamento mensal das aulas.</p>
                                            <p><span className='font-bold'>Parágrafo único.</span> A CONTRATADA é obrigada a avisar com antecedência de 1 mês a respeito do recesso e fornecer conteúdo para todos os alunos durante o período de recesso.</p>
                                        </div>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        <FluencyButton onClick={openSigning}><FaSignature className="w-6 h-auto"/>Assinar</FluencyButton>

        {signing && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center justify-center">
                            
                            <FluencyCloseButton onClick={closeSigning}/>
                            
                              <h3 className="text-lg leading-6 font-medium">
                                  Assinar Contrato                            
                              </h3>
                              <div className="mt-1 flex flex-col items-center gap-3 p-2">
                                <form className='flex flex-col items-center' onSubmit={handleSubmit}>
                                    
                                    <div className='p-3'>
                                    <label>
                                        Nome completo:
                                        <FluencyInput placeholder='Nome' type="text" name="name" value={formData.name} onChange={handleChange} required />
                                    </label>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <label>
                                                CPF:
                                                <FluencyInput placeholder='CPF' type="text" name="cpf" value={formData.cpf} onChange={handleChange} required />
                                            </label>
                                            <label>
                                                Data de Nascimento:
                                                <input className='border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all ease-in-out duration-100' type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                                            </label>
                                        </div>
                                    </div>

                                    <div className='p-6'>
                                        <p className={`${myFont.className} antialiased text-3xl`}>{formData.name}</p>
                                    </div>

                                    <div className='flex flex-col items-start gap-2 p-4'>
                                    <div className="checkbox-wrapper-42">
                                        <input 
                                            type="checkbox"
                                            name="agreedToTerms"
                                            checked={formData.agreedToTerms}
                                            onChange={handleChange}
                                            required 
                                            id="cbx-42"  />
                                        <label className="cbx" htmlFor="cbx-42"></label>
                                        <label className="lbl" htmlFor="cbx-42">Eu li e concordo com os <a className='underline' href="/u/termsandpolicies">termos e condições</a>.</label>
                                    </div>
                                    </div>
                                    <div className="flex justify-center mt-2">
                                        <FluencyButton variant='confirm' type="submit"><FaSignature className="w-6 h-auto"/>Assinar Contrato</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeSigning}>Cancelar</FluencyButton>
                                    </div>
                                </form>
                              </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>)}
    <Toaster />
 </div>
);
}


