import { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";

const GoogleCalendarButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
    document.head.appendChild(linkElement);

    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
    scriptElement.async = true;
    document.head.appendChild(scriptElement);

    return () => {
      document.head.removeChild(linkElement);
      document.head.removeChild(scriptElement);
    };
  }, []);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <div>
      <button onClick={openModal} rel="noopener noreferrer" className="gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-fluency-text-dark text-sm font-medium rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
        Agende uma aula grátis!
      </button>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
          <div className="z-[9999] relative flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-fluency-gray-300 opacity-75"></div>
            </div>
            <div className="z-[100] w-11/12 h-[75vh] relative bg-fluency-text-dark rounded-lg px-4 pt-5 pb-4">
              {/* Google Calendar Scheduling Button */}
              <iframe
                src='https://calendar.google.com/calendar/appointments/schedules/AcZssZ3JWoI62j4eRaQpdj2FvO-QU8PkP2DjKxtF0UZ1MfSI8wHIZS33Tbpeb6UKQmIrYHDbhA3mOn3C?gv=true'
                className="w-full h-[70vh]"></iframe>
              <button
                onClick={closeModal}
                className="absolute top-0 left-0 mt-4 ml-4 text-gray-500 hover:text-gray-900">
                    <span className="sr-only">Fechar</span>
                <IoClose className='w-7 h-7 hover:text-fluency-blue-500 ease-in-out duration-300' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarButton;