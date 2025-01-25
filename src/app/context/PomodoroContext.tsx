import { createContext, useContext, useState, ReactNode } from 'react';

interface PomodoroContextType {
  isPomodoroVisible: boolean;
  togglePomodoroVisibility: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const [isPomodoroVisible, setPomodoroVisible] = useState(false);

  const togglePomodoroVisibility = () => {
    setPomodoroVisible((prevState) => !prevState);
  };

  return (
    <PomodoroContext.Provider value={{ isPomodoroVisible, togglePomodoroVisibility }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
