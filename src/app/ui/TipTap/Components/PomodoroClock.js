import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const PomodoroClock = () => {
  const [minutes, setMinutes] = useState(25); // Default Pomodoro duration
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false); // State to control visibility

  useEffect(() => {
    const savedPosition = JSON.parse(localStorage.getItem('pomodoroPosition'));
    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      const interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            alert("Pomodoro complete!");
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, minutes, seconds]);

  const togglePomodoro = () => {
    setIsActive(!isActive);
  };

  const resetPomodoro = () => {
    setMinutes(25);
    setSeconds(0);
    setIsActive(false);
  };

  const handleStopDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
    localStorage.setItem('pomodoroPosition', JSON.stringify({ x: data.x, y: data.y }));
  };

  const toggleClockVisibility = () => {
    setIsVisible(!isVisible); // Toggle visibility of the Pomodoro clock
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={toggleClockVisibility}
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
      >
        {isVisible ? 'Close' : 'Open'} Pomodoro
      </button>

      {/* Pomodoro Clock */}
      {isVisible && (
        <Draggable position={position} onStop={handleStopDrag}>
          <div className="fixed bg-white p-6 rounded-lg shadow-lg min-w-[200px] z-[999999]">
            <div className="font-semibold text-lg mb-4">
              Pomodoro Clock
            </div>
            <div className="text-4xl font-bold mb-4 text-black">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex justify-between">
              <button
                onClick={togglePomodoro}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetPomodoro}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default PomodoroClock;
