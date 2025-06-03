//@/app/ui/Components/JoyRide/FluencyTour
import { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase'; // Adjust import path

// Joyride style configuration
const joyrideStyles = {
  options: {
    zIndex: 10000,
    primaryColor: "#1A237E",
    textColor: "#1f2937",
    backgroundColor: "#ffffff",
    arrowColor: "#ffffff",
  },
  tooltip: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    border: "1px solid #e5e7eb",
  },
  tooltipTitle: {
    color: "#111827",
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  tooltipContent: {
    color: "#4b5563",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  buttonNext: {
    backgroundColor: "#3B82F6",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
      boxShadow: "0 6px 8px -1px rgba(59, 130, 246, 0.4)",
    },
  },
  buttonBack: {
    color: "#6b7280",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    ":hover": {
      color: "#374151",
      transform: "translateY(-1px)",
    },
  },
  buttonSkip: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    ":hover": {
      color: "#ef4444",
      transform: "translateY(-1px)",
    },
  },
  beacon: {
    backgroundColor: "#3B82F6",
    border: "2px solid #ffffff",
    boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.4)",
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  spotlight: {
    borderRadius: "8px",
    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
};

type TourProps = {
  steps: any[];
  pageKey: string;
  userId?: string;
  delay?: number;
  onTourEnd?: () => void;
};

const Tour = ({ 
  steps, 
  pageKey, 
  userId, 
  delay = 1500, 
  onTourEnd 
}: TourProps) => {
  const [runTour, setRunTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  // Check tour completion status
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!userId) {
        const status = localStorage.getItem(`tour_${pageKey}`);
        setHasCompletedTour(status === 'completed');
        return;
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const completedStatus = userData.tourCompletions?.[pageKey] || false;
          setHasCompletedTour(completedStatus);
        }
      } catch (error) {
        console.error('Error checking tour status:', error);
      }
    };

    checkTourStatus();
  }, [userId, pageKey]);

  // Start tour if not completed
  useEffect(() => {
    if (hasCompletedTour || runTour) return;

    const timer = setTimeout(() => {
      setRunTour(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [hasCompletedTour, delay, runTour]);

  // Handle tour completion
  const handleTourCallback = useCallback(
    async (data: CallBackProps) => {
      const { status, type } = data;

      // Type-safe status check
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRunTour(false);
        setHasCompletedTour(true);

        try {
          if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              [`tourCompletions.${pageKey}`]: true
            });
          } else {
            localStorage.setItem(`tour_${pageKey}`, 'completed');
          }
        } catch (error) {
          console.error('Error saving tour status:', error);
        }

        onTourEnd?.();
      }
    },
    [userId, pageKey, onTourEnd]
  );

  if (hasCompletedTour) return null;

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      styles={joyrideStyles}
      locale={{
        back: "Anterior",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        open: "Abrir diálogo",
        skip: "Pular",
      }}
      callback={handleTourCallback}
    />
  );
};

export default Tour;

// How to use

// // In any page component
// import Tour from '@/components/JoyRide/Tour';
// const PracticePage = () => {
//   const tourSteps = [/* your steps */];
  
//   return (
//     <div>
//       <Tour 
//         steps={tourSteps}
//         pageKey="practice"
//         userId={currentUserId}
//         onTourEnd={() => console.log('Tour completed')}
//       />
//     </div>
//   );
// };