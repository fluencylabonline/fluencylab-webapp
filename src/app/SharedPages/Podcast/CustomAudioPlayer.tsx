'use client'
import React, { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import DOMPurify from 'dompurify'

interface CustomAudioPlayerProps {
  src: string;
  podcastId: string; // Required for saving/loading progress
  title?: string;
  description?: string;
  transcription?: string;
  showDetails?: boolean; // Initial state for details visibility
  onClose?: () => void;
  resumeTime?: number | null; // Added resumeTime prop
}

export default function CustomAudioPlayer({
  src,
  podcastId,
  title,
  description,
  transcription,
  showDetails: initialShowDetails = false, // Use initialShowDetails to avoid state conflicts
  onClose,
  resumeTime, // Receive resumeTime as a prop
}: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const cleanHTML = DOMPurify.sanitize(transcription || "")

  const { data: session } = useSession(); // Get user session for progress saving

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(initialShowDetails);

  // State variables for progress tracking within the player
  // We'll still use these internally for saving, but the initial resumeTime comes from props
  const [internalResumeTime, setInternalResumeTime] = useState<number | null>(resumeTime || null);
  const [completed, setCompleted] = useState(false);
  // hasResumed state is crucial here to prevent seeking multiple times
  const [hasResumed, setHasResumed] = useState(false);


  // --- Load initial resumeTime from props and fetch completed status ---
  // This effect runs when the component mounts or when the podcastId or resumeTime prop changes
  useEffect(() => {
    console.log("useEffect [podcastId, resumeTime, session] triggered");
    // Reset hasResumed when a new podcast is loaded
    setHasResumed(false);
    // Set the internal resume time from the prop
    setInternalResumeTime(resumeTime || null);
    // Reset completed state for the new podcast initially
    setCompleted(false); // Assume not completed until fetched

    // Fetch the latest completed status from Firebase when the podcast changes
    const fetchCompletedStatus = async () => {
        if (!session?.user?.id || !podcastId) {
            console.log("Skipping fetchCompletedStatus: No session or podcastId");
            return;
        }
        try {
            console.log(`Fetching completed status for user: ${session.user.id}, podcast: ${podcastId}`);
            const docRef = doc(db, 'users', session.user.id, 'podcastProgress', podcastId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Completed status fetched:", data.completed);
                setCompleted(data.completed || false);
            } else {
                 console.log("No progress document found.");
                 setCompleted(false); // Ensure completed is false if no document exists
            }
        } catch (error) {
            console.error("Error fetching completed status:", error);
        }
    };
    fetchCompletedStatus();

  }, [podcastId, resumeTime, session]); // Rerun effect when podcastId, resumeTime prop, or session changes


  // --- Auto-seek to resumeTime and play ---
  // This effect handles the actual seeking and playback start
  useEffect(() => {
    const audioElement = audioRef.current;

    // Only attempt to resume if audio element exists, internalResumeTime is set (> 0),
    // hasn't resumed yet, and the audio is ready (readyState >= 3 means enough data to play)
    // Also ensure the component is still mounted
    if (audioElement && internalResumeTime !== null && internalResumeTime > 0 && !hasResumed && audioElement.readyState >= 3) {
      console.log(`Attempting to resume to ${internalResumeTime} and play.`);
      audioElement.currentTime = internalResumeTime;
      audioElement.play()
        .then(() => {
          console.log("Playback started successfully after resume.");
          setIsPlaying(true);
          setHasResumed(true); // Mark as resumed after successful play
        })
        .catch(error => {
          console.error("Error attempting to play after seeking:", error);
          // If auto-play fails (e.g., browser policy), don't mark as resumed
          // The user will need to manually click play.
        });
    }
     // Add a listener for 'canplaythrough' as another readiness indicator
    const handleCanPlayThrough = () => {
         console.log("canplaythrough event fired.");
         if (audioElement && internalResumeTime !== null && internalResumeTime > 0 && !hasResumed) {
             console.log(`canplaythrough: Attempting resume to ${internalResumeTime}`);
             audioElement.currentTime = internalResumeTime;
             audioElement.play()
                 .then(() => {
                     console.log("Playback started successfully after canplaythrough.");
                     setIsPlaying(true);
                     setHasResumed(true);
                 })
                 .catch(error => {
                     console.error("Error playing after canplaythrough and seeking:", error);
                 });
         }
    };

    if(audioElement) {
        audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
    }


    return () => {
        // Clean up the event listener
        if(audioElement) {
            audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
        }
    };

  }, [internalResumeTime, hasResumed, audioRef.current?.readyState]); // Rerun when internalResumeTime, hasResumed, or audio readyState changes


  // --- Save progress every 5s ---
  useEffect(() => {
    // Don't save progress if the episode is already completed
    if (completed) {
        console.log("Skipping save progress: Episode completed.");
        return;
    }

    // Set up an interval to save progress every 5 seconds
    const interval = setInterval(() => {
      // Ensure user is logged in, podcastId is available, and audio element exists
      if (!session?.user?.id || !podcastId || !audioRef.current) {
         console.log("Skipping save progress: Missing session, podcastId, or audioRef.");
         return;
      }

      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;

      // Don't save if duration is not available, is NaN, or is infinite
      if (!duration || isNaN(duration) || !isFinite(duration)) {
         console.log("Skipping save progress: Invalid duration.");
         return;
      }

      // Consider the episode completed if within the last 10 seconds
      const isComplete = duration > 0 && current >= duration - 10; // Add duration check

      console.log(`Saving progress: current=${current}, duration=${duration}, completed=${isComplete}`);

      try {
        // Reference to the user's podcast progress document
        const progressRef = doc(db, 'users', session.user.id, 'podcastProgress', podcastId);
        // Save progress data to Firebase, merging with existing data
        setDoc(progressRef, {
          progress: current,
          duration,
          completed: isComplete,
          updatedAt: serverTimestamp(), // Use server timestamp for accurate time
        }, { merge: true });

        // Update completed state if the episode is marked as complete
        if (isComplete) {
          console.log("Episode marked as completed.");
          setCompleted(true);
        }
      } catch (error) {
        console.error("Error saving podcast progress:", error);
      }
    }, 5000); // Save every 5000 milliseconds (5 seconds)

    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => {
        console.log("Clearing progress save interval.");
        clearInterval(interval);
    }
  }, [session, podcastId, completed]); // Rerun effect if session, podcastId, or completed state changes

  // --- Playback Controls ---
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false); // Ensure state is updated on pause
    } else {
      // If resuming from a specific time and hasn't resumed yet, seek before playing
      if (internalResumeTime !== null && internalResumeTime > 0 && !hasResumed) {
         console.log(`Manual play: Attempting resume to ${internalResumeTime}`);
         audioRef.current.currentTime = internalResumeTime;
         setHasResumed(true); // Mark as resumed on manual play if needed
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error("Error playing audio:", error));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  // This function is also used by the auto-resume effect, so it's important it sets duration correctly
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        console.log("LoadedMetadata event fired.");
        setDuration(audioRef.current.duration);
         // The auto-resume logic is primarily in the useEffect that watches readyState
         // but triggering a check here is also a good practice.
         // The useEffect will handle the actual seeking and playing based on state.
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    // If the user seeks, consider the resume point handled for auto-resume
    setHasResumed(true);
     // Also ensure playback starts after seeking if it was paused
     if (!isPlaying) {
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(error => console.error("Error playing after seeking:", error));
     }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      Math.max(audioRef.current.currentTime + seconds, 0),
      duration
    );
    setCurrentTime(audioRef.current.currentTime); // Update current time display immediately
    // If the user skips, consider the resume point handled for auto-resume
    setHasResumed(true);
     // Also ensure playback starts after skipping if it was paused
     if (!isPlaying) {
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(error => console.error("Error playing after skipping:", error));
     }
  };

  const changePlaybackRate = (rate: number) => {
    if (!audioRef.current) return;
    setPlaybackRate(rate);
    audioRef.current.playbackRate = rate;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00'; // Handle invalid time
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full p-6  shadow-xl relative transition-all duration-300 hover:shadow-2xl rounded-xl">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
           setIsPlaying(false);
           setCompleted(true); // Mark as completed when audio ends
           // Save completed status to Firebase
           if (session?.user?.id && podcastId) {
              const progressRef = doc(db, 'users', session.user.id, 'podcastProgress', podcastId);
               setDoc(progressRef, { completed: true, updatedAt: serverTimestamp() }, { merge: true });
           }
        }}
        onError={(e) => console.error("Audio error:", e)} // Add error handling for audio element
        preload="metadata"
        className="w-full" // Added Tailwind class for width
      />

      <div className='flex flex-row items-center justify-between mb-4'>
        {title && (
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
            <svg className="w-6 h-6 text-fluency-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            {title}
          </h2>
        )}

        {(description || transcription) && (
          <button
            className="text-sm font-medium text-fluency-blue-600 hover:text-fluency-blue-700 flex items-center gap-1 transition-colors"
            onClick={() => setShowFullDetails((prev) => !prev)}
          >
            {showFullDetails ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-fluency-red-500 transition-colors rounded-full"
            aria-label="Close player"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showFullDetails && (
        <div className="space-y-3 mb-6">
          {transcription && (
            <div className="bg-gray-50 dark:bg-fluency-gray-700 rounded-lg p-4">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-blue-600 font-medium list-none">
                  <span>Transcrição</span>
                  <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div dangerouslySetInnerHTML={{ __html: cleanHTML }} className="mt-3 text-gray-600 whitespace-pre-wrap font-sans" />
              </details>
            </div>
          )}
           {/* Completed Status Message */}
           {completed && <p className="text-green-600 font-medium mt-2">Episode completed ✓</p>}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-gray-200 rounded-full accent-fluency-blue-600 hover:accent-fluency-blue-700 cursor-pointer transition-colors"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => skipTime(-15)}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Skip back 15 seconds"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7m5" />
            </svg>
          </button>
          
          <button
            onClick={togglePlay}
            className="p-3 bg-fluency-blue-600 hover:bg-fluency-blue-700 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => skipTime(15)}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Skip forward 15 seconds"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 flex justify-end">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {showSettings && (
            <div className="absolute bottom-full right-0 mb-3 bg-white dark:bg-fluency-gray-800 border border-gray-100 dark:border-fluency-gray-700 rounded-xl shadow-xl p-4 w-64 space-y-4 animate-slide-up z-10">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-200 rounded-full accent-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Speed
                </label>
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border bg-fluency-gray-200 dark:bg-fluency-gray-600 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <option key={rate} value={rate}>{rate}x</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
