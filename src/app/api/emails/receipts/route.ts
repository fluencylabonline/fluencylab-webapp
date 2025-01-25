import { Resend } from 'resend';
import { Receipts } from '@/email/receipts';
import { Canceling } from '@/email/canceling';
import { Welcome } from '@/email/welcome'; // Import the Welcome component
import { WelcomeTeacher } from '@/email/welcomeTeacher';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

type MonthKey = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

// Mapping object to translate months from English to Portuguese
const monthsMap: Record<MonthKey, string> = {
  January: 'Janeiro',
  February: 'Fevereiro',
  March: 'Março',
  April: 'Abril',
  May: 'Maio',
  June: 'Junho',
  July: 'Julho',
  August: 'Agosto',
  September: 'Setembro',
  October: 'Outubro',
  November: 'Novembro',
  December: 'Dezembro',
};

export async function POST(request: Request) {
  try {
    const { 
      studentMail, 
      selectedMonth, 
      paymentStatus, 
      studentName, 
      studentEmail, 
      paymentKey, 
      paymentKeyProp, 
      selectedYear, 
      mensalidade, 
      templateType,
      userName,
      teacherName
    } = await request.json();

    const translatedMonth = monthsMap[selectedMonth as MonthKey];
    const emailSubject = `FluencyLab - Pagamento de Mensalidade`;

    let results;
    if (templateType === 'receipts') {
      results = await resend.emails.send({
        from: 'financeiro@fluencylab.me',
        to: studentMail,
        subject: emailSubject,
        react: Receipts({ selectedMonth, studentName, paymentKeyProp, selectedYear, mensalidade }),
      });
    } 

    if (templateType === 'canceling') {
      results = await resend.emails.send({
        from: 'contato@fluencylab.me',
        to: studentMail,
        subject: 'FluencyLab - Nunca é um adeus...',
        react: Canceling({ studentName }),
      });
    } 
    
    if (templateType === 'welcome') {
      results = await resend.emails.send({
        from: 'coordenação@fluencylab.me',
        to: studentName,
        subject: userName,
        react: Welcome({ studentName, userName }),
      });
    }

    if (templateType === 'welcomeTeacher') {
      results = await resend.emails.send({
        from: 'coordenação@fluencylab.me',
        to: studentMail,
        subject: teacherName,
        react: WelcomeTeacher({ studentName, userName, studentMail, teacherName }),
      });
    }

    return new Response(JSON.stringify({ data: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
