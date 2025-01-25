import { db } from "@/app/firebase";
import FluencyButton from "@/app/ui/Components/Button/button";
import { Tooltip } from "@nextui-org/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { RiMailSendFill } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";

interface ConfirmAndEmailProps {
  studentMail: any;
  selectedMonth: string;
  studentName: string;
  mensalidade: number;
  selectedYear: number;
  tab: string;
  studentId: string;
}

const ConfirmAndEmail: React.FC<ConfirmAndEmailProps> = ({
  studentMail,
  selectedMonth,
  studentName,
  mensalidade,
  selectedYear,
  tab,
  studentId,
}) => {
  const handleComprovante = async () => {
    const newPaymentKey = uuidv4();

    try {
      // Send email
      await toast.promise(
        fetch("/api/emails/receipts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentMail,
            selectedMonth,
            studentName,
            paymentKeyProp: newPaymentKey,
            mensalidade,
            selectedYear,
            templateType:
              tab === "cancelado"
                ? "canceling"
                : tab === "pago (mensalidade)"
                ? "receipts"
                : undefined,
          }),
        }),
        {
          loading: "Enviando comprovante...",
          success: "Comprovante enviado!",
          error: "Erro ao enviar comprovante!",
        }
      );

      // Confirm payment in Firestore
      await confirmPayment(studentId, new Date(), selectedMonth, newPaymentKey, mensalidade);
    } catch (error) {
      console.error("Error in handleComprovante:", error);
      toast.error("Erro ao enviar email ou confirmar pagamento!", {
        position: "top-center",
      });
    }
  };

  const confirmPayment = async (
    userId: string,
    date: Date,
    selectedMonth: string,
    paymentKey: string,
    mensalidade: number
  ) => {
    try {
      const year = date.getFullYear();
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();

      if (userData) {
        const currentPayments = userData.payments || {};
        const yearPayments = currentPayments[year] || {};
        const currentStatus = yearPayments[selectedMonth]?.status || "notPaid";
        const newStatus = currentStatus === "paid" ? "notPaid" : "paid";

        yearPayments[selectedMonth] = {
          status: newStatus,
          paymentKey: newStatus === "paid" ? paymentKey : undefined,
          mensalidade,
        };

        await setDoc(
          userRef,
          { payments: { ...currentPayments, [year]: yearPayments } },
          { merge: true }
        );

        toast.success(
          newStatus === "paid" ? "Pagamento registrado!" : "Pagamento retirado!",
          { position: "top-center" }
        );
      } else {
        console.error("User data is undefined");
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Erro ao confirmar pagamento!", { position: "top-center" });
    }
  };

  return (
    <div>
      <Tooltip content='Enviar comprovante' className="px-2 py-1 rounded-md bg-fluency-gray-500 text-white font-bold">
        <button
          onClick={handleComprovante}
          className={`p-3 rounded-md bg-fluency-bg-dark ${tab === 'pago (mensalidade)' && 'text-green-500 hover:text-green-700 duration-300 ease-in-out transition-all' || tab === 'cancelado' && 'text-yellow-400 hover:text-yellow-700 duration-300 ease-in-out transition-all'}`}
        >
          <RiMailSendFill />
        </button>
      </Tooltip>
    </div>
  );
};

export default ConfirmAndEmail;
