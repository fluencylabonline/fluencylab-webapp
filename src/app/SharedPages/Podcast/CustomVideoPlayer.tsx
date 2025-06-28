'use client'

import { db } from '@/app/firebase';
import DOMPurify from 'dompurify';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useRef, useState, useEffect } from 'react';

interface CustomVideoPlayerProps {
  src: string;
  podcastId: string; // Required for saving/loading progress
  title?: string;
  description?: string;
  transcription?: string;
  showDetails?: boolean; // Initial state for details visibility
  onClose?: () => void;
  resumeTime?: number | null; // Added resumeTime prop
}

export default function CustomVideoPlayer({
  src,
  podcastId,
  title,
  description,
  transcription,
  showDetails: initialShowDetails = false,
  onClose,
  resumeTime,
}: CustomVideoPlayerProps) {

  // Use only one video ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanHTML = DOMPurify.sanitize(transcription || "")

  const { data: session } = useSession();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  // State to control the expanded view of the player
  const [showFullDetails, setShowFullDetails] = useState(initialShowDetails);
  // State for native video fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasDetails = !!(title || description || transcription);

  // Internal state for managing resume time and completed status
  const [internalResumeTime, setInternalResumeTime] = useState<number | null>(resumeTime || null);
  const [completed, setCompleted] = useState(false);
  // Flag to prevent seeking to resume time multiple times on load
  const [hasResumed, setHasResumed] = useState(false);

  // Ref for debouncing time updates
  const timeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // --- Load initial resumeTime from props and fetch completed status ---
  // This effect runs when the component mounts or when podcastId, resumeTime prop, or session changes
  useEffect(() => {
    console.log("useEffect [podcastId, resumeTime, session] triggered");
    // Reset hasResumed when a new podcast is loaded or resumeTime changes
    setHasResumed(false);
    // Set the internal resume time from the prop
    setInternalResumeTime(resumeTime || null);
    // Reset completed state for the new podcast initially
    setCompleted(false); // Assume not completed until fetched

    // Fetch the latest completed status from Firebase when the podcast changes
    const fetchCompletedStatus = async () => {
        // Use session?.user?.email for next-auth session email as user ID for Firebase
        if (!session?.user?.email || !podcastId) {
            console.log("Skipping fetchCompletedStatus: No session email or podcastId");
            return;
        }
        try {
            console.log(`Workspaceing completed status for user: ${session.user.email}, podcast: ${podcastId}`);
            const docRef = doc(db, 'users', session.user.email, 'podcastProgress', podcastId);
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
  // This effect handles the actual seeking and playback start when the video is ready
  useEffect(() => {
    const videoElement = videoRef.current;

    // Function to attempt seeking and playing on the video element
    const attemptResumeAndPlay = (videoElement: HTMLVideoElement | null) => {
        if (!videoElement) {
            console.log("Attempt resume: Video element is null.");
            return;
        }

        console.log(`Attempting resume: internalResumeTime=${internalResumeTime}, hasResumed=${hasResumed}, readyState=${videoElement.readyState}`);

        // Check if resume is needed and the video is ready enough to play (readyState 3 or 4)
        // Also check if the video is currently paused or its currentTime is 0 to avoid interrupting playback
        if (internalResumeTime !== null && internalResumeTime > 0 && !hasResumed && videoElement.readyState >= 3 && (videoElement.paused || videoElement.currentTime === 0)) {
            console.log(`Ready to resume. Seeking to ${internalResumeTime}.`);
            videoElement.currentTime = internalResumeTime;
            // Try to play, but catch potential autoplay errors (e.g., browser policies)
            videoElement.play()
                .then(() => {
                    console.log("Playback started successfully after resume.");
                    setIsPlaying(true);
                    setHasResumed(true); // Mark as resumed after successful play attempt
                })
                .catch(error => {
                    console.error("Error attempting to auto-play after seeking:", error);
                    // If auto-play fails, the browser typically prevents it.
                    // The user will need to manually click play. Don't mark as resumed yet.
                });
        } else if (internalResumeTime === 0 && !hasResumed && videoElement.readyState >= 3 && (videoElement.paused || videoElement.currentTime === 0)) {
             // Handle case where resumeTime is 0 (e.g., replay from beginning)
             console.log("Resume time is 0. Starting from beginning.");
             videoElement.currentTime = 0;
             videoElement.play()
               .then(() => {
                   console.log("Playback started successfully from beginning.");
                   setIsPlaying(true);
                   setHasResumed(true); // Mark as resumed
               })
                 .catch(error => {
                   console.error("Error attempting to play from beginning:", error);
                 });
        } else {
             console.log("Conditions for auto-resume not met or already resumed/playing.");
        }
    };

    // Attempt resume when component mounts or relevant props change
    // Debounce this attempt slightly to avoid race conditions with video loading
    const resumeAttemptTimeout = setTimeout(() => {
        attemptResumeAndPlay(videoElement);
    }, 100); // Small delay

    // Also attempt resume when media is loaded/canplay, in case it wasn't ready initially
    const handleMediaReady = (e: Event) => {
        const videoElement = e.currentTarget as HTMLVideoElement;
        console.log(`${e.type} event fired.`);
         // Debounce this attempt as well
        setTimeout(() => {
            attemptResumeAndPlay(videoElement);
        }, 50); // Even smaller delay for event

    };

    if(videoElement) {
        // Add listeners for 'loadedmetadata' and 'canplaythrough' as readiness indicators
        videoElement.addEventListener('loadedmetadata', handleMediaReady);
        videoElement.addEventListener('canplaythrough', handleMediaReady);
    }

    // Clean up timeouts and event listeners when the effect dependencies change or component unmounts
    return () => {
        clearTimeout(resumeAttemptTimeout);
        if(videoElement) {
            videoElement.removeEventListener('loadedmetadata', handleMediaReady);
            videoElement.removeEventListener('canplaythrough', handleMediaReady);
        }
    };

  }, [internalResumeTime, hasResumed, videoRef.current]); // Rerun when internalResumeTime, hasResumed, or video ref changes


  // --- Save progress every 5s ---
  useEffect(() => {
    // Don't save progress if the episode is already completed
    if (completed) {
        console.log("Skipping save progress: Episode completed.");
        return;
    }

    // Set up an interval to save progress every 5 seconds
    const interval = setInterval(() => {
      // Ensure user is logged in, podcastId is available, and the video element exists
      const videoElement = videoRef.current;
      // Use session?.user?.email for next-auth session email
      if (!session?.user?.email || !podcastId || !videoElement) {
         console.log("Skipping save progress: Missing session email, podcastId, or videoRef.");
         return;
      }

      const current = videoElement.currentTime;
      const duration = videoElement.duration;

      // Don't save if duration is not available, is NaN, or is infinite
      if (!duration || isNaN(duration) || !isFinite(duration)) {
         console.log("Skipping save progress: Invalid duration.");
         return;
      }

      // Consider the episode completed if within the last 10 seconds OR if current time is at or past duration
      const isComplete = duration > 0 && (current >= duration - 10 || current >= duration);


      console.log(`Saving progress: current=${current}, duration=${duration}, completed=${isComplete}`);

      try {
        // Reference to the user's podcast progress document using email as user ID
        const progressRef = doc(db, 'users', session.user.email, 'podcastProgress', podcastId);
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
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    const videoElement = videoRef.current;
    if (!videoElement) {
         console.log(`togglePlay: Video element is null.`);
         return;
    }

    console.log(`togglePlay: newIsPlaying=${newIsPlaying}, internalResumeTime=${internalResumeTime}, hasResumed=${hasResumed}`);

    if (newIsPlaying) {
         // On manual play, if resume is needed and hasn't happened yet, seek before playing
         if (internalResumeTime !== null && internalResumeTime >= 0 && !hasResumed) {
             console.log(`Manual play: Attempting resume to ${internalResumeTime}`);
             videoElement.currentTime = internalResumeTime;
             setHasResumed(true); // Mark as resumed on manual play if needed
         }
         // Attempt to play the video
         videoElement.play().catch(console.error);
    } else {
         // Pause the video
         videoElement.pause();
    }
  };


  // Update currentTime state as the video plays
  // Debounce state update to improve performance
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const newTime = video.currentTime;

    // Clear any existing debounce timeout
    if (timeUpdateTimeoutRef.current) {
        clearTimeout(timeUpdateTimeoutRef.current);
    }

    // Set a new timeout to update the state after a short delay (e.g., 50ms)
    // This reduces the frequency of state updates triggered by the 'timeupdate' event
    timeUpdateTimeoutRef.current = setTimeout(() => {
      setCurrentTime(newTime);
    }, 50); // Update state at most every 50ms
  };

  // Cleanup the debounce timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeUpdateTimeoutRef.current) {
        clearTimeout(timeUpdateTimeoutRef.current);
      }
    };
  }, []); // Effect runs only on mount and unmount


  // Update duration state and set initial volume when metadata is loaded
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
    video.volume = volume; // Set initial volume
  };


  // Handle seeking using the progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time); // Update state immediately for responsive UI
    if (videoRef.current) {
        videoRef.current.currentTime = time;
         // On manual seek, ensure playback continues if it was playing
         if (isPlaying) {
             videoRef.current.play().catch(console.error);
         }
    }

    // If the user seeks, consider the resume point handled for auto-resume on subsequent plays
    setHasResumed(true);
  };

  // Skip time forward or backward
  const skipTime = (seconds: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newTime = Math.min(Math.max(videoElement.currentTime + seconds, 0), duration);
    setCurrentTime(newTime); // Update state immediately
    videoElement.currentTime = newTime; // Update video time

    // If the user skips, consider the resume point handled
    setHasResumed(true);
    // Ensure playback starts after skipping if it was paused
    if (!isPlaying) {
        videoElement.play().catch(console.error);
        setIsPlaying(true); // Update playing state if playback starts
    }
  };

  // Change video playback rate
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  // Handle volume changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol); // Update state
    if (videoRef.current) videoRef.current.volume = vol; // Update video volume
  };

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00'; // Handle invalid time
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle native fullscreen toggling
  const toggleNativeFullscreen = () => {
    if (!videoRef.current) return;

    // Find the main player container element
    const mainPlayerDiv = videoRef.current.closest('.fixed.bottom-0');

    if (!document.fullscreenElement) {
      // If not currently in fullscreen, request fullscreen
      // Request fullscreen on the main player div when details are expanded
      // This keeps the controls and details visible within the fullscreen view
      if(mainPlayerDiv && showFullDetails) {
         mainPlayerDiv.requestFullscreen().catch(console.error);
      } else {
         // If not in expanded view, or if the parent doesn't support fullscreen,
         // request fullscreen on the video element itself (standard behavior)
          videoRef.current.requestFullscreen().catch(console.error);
      }

    } else {
      // If currently in fullscreen, exit fullscreen
      document.exitFullscreen().catch(console.error);
    }
  };

  // Effect to listen for native fullscreen changes and update state
  useEffect(() => {
      const handleFullscreenChange = () => {
          const mainPlayerDiv = videoRef.current?.closest('.fixed.bottom-0');
           // Check if either the video element or the main player div is currently in fullscreen
          setIsFullscreen(!!document.fullscreenElement &&
                         (document.fullscreenElement === videoRef.current || document.fullscreenElement === mainPlayerDiv));
      };
      // Listen for fullscreen changes on the document
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      // Also listen specifically on the video element for robustness
      const videoElement = videoRef.current;
      if(videoElement) {
          videoElement.addEventListener('fullscreenchange', handleFullscreenChange);
      }
      // Cleanup listeners
      return () => {
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
           if(videoElement) {
               videoElement.removeEventListener('fullscreenchange', handleFullscreenChange);
           }
      }
  }, [videoRef.current]); // Add videoRef.current as dependency


  // Effect to sync video properties when switching between compact and expanded views
  // This ensures continuity of playback state, time, volume, and speed
  useEffect(() => {
      const videoElement = videoRef.current;
      if (videoElement) {
          // Ensure current time, volume, and playback rate are consistent
          videoElement.currentTime = currentTime;
          videoElement.volume = volume;
          videoElement.playbackRate = playbackRate;
          // Ensure play/pause state is synced
          if (isPlaying) {
              videoElement.play().catch(console.error);
          } else {
              videoElement.pause();
          }
      }
  }, [showFullDetails]); // Rerun when view state changes (between compact and expanded)


  return (
    <div className={`
      fixed bottom-0 left-0 right-0 w-full 
      rounded-xl backdrop-blur-lg shadow-lg
      flex ${showFullDetails ? 'flex-col' : 'flex-row items-center'} // Layout changes based on details visibility
      transition-all duration-300 ease-in-out // Smooth height and flex changes
      ${showFullDetails ? 'h-[max(60vh,400px)] max-h-[90vh]' : 'h-[100px]'} // Dynamic height based on details
      z-50 
    `}>
       <div className={`
           relative bg-black flex items-center justify-center overflow-hidden
           ${showFullDetails ? 'flex-grow' : 'w-24 h-full flex-shrink-0 overflow-hidden'}
       `}>
            <video
                ref={videoRef}
                src={src}
                className={`w-full h-full ${showFullDetails ? 'object-contain' : 'object-cover'}`} // object-contain when large, object-cover when thumbnail
                 onTimeUpdate={handleTimeUpdate} 
                 onLoadedMetadata={handleLoadedMetadata} 
                  onEnded={() => { 
                      setIsPlaying(false);
                      setCompleted(true);
                      if (session?.user?.email && podcastId) {
                        const progressRef = doc(db, 'users', session.user.email, 'podcastProgress', podcastId);
                         setDoc(progressRef, { completed: true, updatedAt: serverTimestamp() }, { merge: true });
                      }
                  }}
                onError={(e) => console.error("Video error:", e)} // Log video errors
                preload="metadata" // Preload metadata to get duration quickly
                muted={volume === 0} // Mute video if volume is zero
                loop={false} // Video does not loop
                playsInline // Important for mobile browsers to play inline
                onClick={showFullDetails ? togglePlay : undefined} // Toggle play on click only in expanded video area
            />
            {!isPlaying && !isFullscreen && showFullDetails && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
                  <button className="p-3 bg-white/70 hover:bg-white rounded-full transition-colors pointer-events-none"> {/* pointer-events-none allows click to pass to the parent div */}
                     <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  </button>
               </div>
            )}
       </div>

      {/* Content Area (Contains Controls and Details) - Flex row in compact, flex column in expanded */}
       <div className={`
           flex-grow flex bg-fluency-gray-100 dark:bg-fluency-gray-900
           ${showFullDetails ? 'flex-col h-fit' : 'flex-row items-center'}
           px-4 py-2
       `}>
           {/* Content specific to the Compact View (Row Layout) */}
           {!showFullDetails && (
               <div className='w-full flex-grow flex flex-wrap items-center justify-between'>
                  <div className='flex sm:flex-col items-start justify-start gap-1'>
                    {/* Title and basic info area in compact view */}
                    <div className="flex-grow flex items-center min-w-0"> {/* min-w-0 for truncation */}
                        {title && <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 truncate">{title}</h3>}
                    </div>

                    {/* Basic Controls in compact view */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={togglePlay} className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        </button>
                        <div className="text-xs text-gray-600 hidden sm:block">{formatTime(currentTime)} / {formatTime(duration)}</div>
                    </div>
                  </div>

                    {/* Button to show details (only if details exist) */}
                    {hasDetails && (
                      <button onClick={() => setShowFullDetails(true)} className="p-1 text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label="Show details">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    )}

                    {!showFullDetails && (
                      <div className="px-4 w-[70%] flex-shrink-0 pb-2">
                        <input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-200 rounded-full accent-red-600 hover:accent-fluency-blue-700 cursor-pointer transition-colors" />
                      </div>    
                    )}

                    {onClose && <button onClick={onClose} className="p-1 text-gray-800 dark:text-gray-200 hover:bg-red-100 rounded-full transition-colors" aria-label="Close player"><svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
               </div>
           )}

           {/* Content specific to the Expanded View (Column Layout) */}
           {showFullDetails && (
               <>
                  <div className="bg-fluency-gray-100 dark:bg-fluency-gray-900 flex-shrink-0 px-0 py-2 flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                          <button onClick={() => skipTime(-15)} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label="Skip back 15 seconds">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7m5" /></svg>
                          </button>
                          <button onClick={togglePlay} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          </button>
                          <button onClick={() => skipTime(15)} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label="Skip forward 15 seconds">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                          <div className="text-sm text-gray-700 hidden sm:block">{formatTime(currentTime)} / {formatTime(duration)}</div>
                      </div>

                      <div className="flex items-center gap-4 flex-grow">
                          <input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek} className="flex-grow h-2 bg-gray-300 rounded-full accent-fluency-blue-600 hover:accent-fluency-blue-700 cursor-pointer transition-colors mx-4" /> {/* Added horizontal margin */}
                          <div className="flex flex-row flex-wrap items-center justify-center">
                              <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label="Settings">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </button>
                              {showSettings && (
                                <div className="flex flex-row items-center gap-6 text-gray-800 dark:text-gray-200">
                                    <div className="flex flex-row items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-full h-2 bg-gray-300 rounded-full accent-fluency-blue-600 cursor-pointer" />
                                    </div>
                                    <div className="flex flex-row items-center gap-1">
                                        <select value={playbackRate} onChange={(e) => changePlaybackRate(parseFloat(e.target.value))} className="w-full px-1 py-1 text-sm bg-gray-100 border border-gray-300 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-fluency-blue-500 outline-none transition-all">
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (<option key={rate} value={rate}>{rate}x</option>))}
                                        </select>
                                    </div>
                                </div>
                              )}
                          </div>
                          
                          {hasDetails && !isFullscreen && (
                            <button onClick={() => setShowFullDetails(false)} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label="Hide details">
                              <svg className="w-6 h-6 transform rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                          )}
                          <button onClick={toggleNativeFullscreen} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-full transition-colors" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{isFullscreen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7m12 0l-7 7m7-7v6m0-6h-6" />}</svg>
                          </button>
                          {onClose && (
                            <button onClick={onClose} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-red-100 rounded-full transition-colors" aria-label="Close player">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                      </div>
                  </div>

                  {/* Details Section (Scrollable in Expanded View) */}
                  {hasDetails && isFullscreen && (
                    <div className="flex-grow p-4 sm:p-6 text-gray-800 dark:text-gray-200 overflow-y-auto"> {/* flex-grow to take remaining space, overflow-y-auto for scrolling */}
                        {transcription && (
                            <div className="bg-gray-100 rounded-lg p-3">
                                {/* Use details/summary for collapsible transcription */}
                                <details className="group" open={initialShowDetails}>
                                    <summary className="flex items-center gap-2 cursor-pointer text-fluency-blue-600 font-medium list-none text-sm">
                                        <span>Transcription</span>
                                        <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    {/* Use pre to preserve line breaks and formatting in transcription */}
                                    <div dangerouslySetInnerHTML={{ __html: cleanHTML }} className="mt-3 text-gray-600 whitespace-pre-wrap font-sans" />
                                </details>
                            </div>
                        )}
                    </div>
                  )}
               </>
           )}
       </div>

    </div>
  )
}