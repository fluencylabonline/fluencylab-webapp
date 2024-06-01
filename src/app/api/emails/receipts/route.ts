import { Resend } from 'resend';
import { Receipts } from '@/email/receipts';

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
    const { studentMail, selectedMonth, paymentStatus, studentName, studentEmail, paymentKey, paymentKeyProp, selectedYear, mensalidade } = await request.json();
    const translatedMonth = monthsMap[selectedMonth as MonthKey];
    const emailSubject = `FluencyLab - Pagamento de Mensalidade`;

    const results = await resend.emails.send({
        from: 'financeiro@fluencylab.online',
        to: studentMail,
        subject: emailSubject,
        react: Receipts({ selectedMonth: translatedMonth, studentName, paymentKeyProp, selectedYear, mensalidade }),
      });

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
