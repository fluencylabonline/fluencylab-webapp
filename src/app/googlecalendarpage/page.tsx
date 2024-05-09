"use client"; 
import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";

function GoogleCalendarPage() {
  {/*PERSIST DARK MODE*/}
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  const [isChecked, setIsChecked] = useState(() => {
    if (isLocalStorageAvailable) {
      const storedDarkMode = localStorage.getItem('isDarkMode');
      return storedDarkMode ? storedDarkMode === 'true' : true;
    }
    return true; // Default to true if localStorage is not available
  });
  
  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem('isDarkMode', isChecked.toString());
      document.body.classList.toggle('dark', isChecked);
    }
  }, [isChecked, isLocalStorageAvailable]);
  
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Simulate delay of 2 seconds for the iframe content to appear
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIframeLoaded(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="container overflow-x-hidden w-screen h-screen flex flex-col items-center relative">
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-200 bg-opacity-50 z-50">
          <div className="flex flex-col bg-neutral-300 w-56 h-64 animate-pulse rounded-xl p-4 gap-4">
            <div className="bg-neutral-400/50 w-full h-32 animate-pulse rounded-md"></div>
            <div className="flex flex-col gap-2">
              <div className="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
              <div className="bg-neutral-400/50 w-4/5 h-4 animate-pulse rounded-md"></div>
              <div className="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
              <div className="bg-neutral-400/50 w-2/4 h-4 animate-pulse rounded-md"></div>
            </div>
          </div>
        </div>
      )}

      <iframe
        src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3JWoI62j4eRaQpdj2FvO-QU8PkP2DjKxtF0UZ1MfSI8wHIZS33Tbpeb6UKQmIrYHDbhA3mOn3C?gv=true"
        style={{ border: '0', transition: 'opacity 0.5s ease', opacity: iframeLoaded ? 1 : 0 }}
        className={`w-full h-[98vh] overflow-x-hidden`}
        title="Google Calendar Appointment Scheduling"
        onLoad={() => setLoading(false)}
      ></iframe>

      <Link href="/landing">
        <button className="absolute top-2 left-3 text-gray-500 hover:text-gray-900">
          <BsArrowLeft className='w-7 h-7' />
        </button>
      </Link>
    </div>
  );
};

export default GoogleCalendarPage;
