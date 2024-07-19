import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayerComponent.css';
import { HiVolumeUp } from 'react-icons/hi';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioPlayerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0); // Initial playback rate

  useEffect(() => {
    audioRef.current.src = src; // Update audio source when src prop changes
    audioRef.current.load(); // Reload the audio element
  
    // Remove the play() call to prevent automatic playback
    // const playPromise = audioRef.current.play();
    // if (playPromise !== undefined) {
    //   playPromise
    //     .then(_ => {
    //       setIsPlaying(true);
    //     })
    //     .catch(error => {
    //       console.error('Audio playback error:', error);
    //       setIsPlaying(false);
    //     });
    // }
  
    return () => {
      audioRef.current.pause();
      setIsPlaying(false);
    };
  }, [src]);
  

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      const progress = (audio.currentTime / audio.duration) * 100;
      if (audioPlayerRef.current) {
        const progressBar = audioPlayerRef.current.querySelector('.progress') as HTMLDivElement;
        progressBar.style.width = `${progress}%`;
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
      audio.volume = volume;
    };

    audio.addEventListener('loadeddata', updateDuration);
    audio.addEventListener('timeupdate', updateTime);

    return () => {
      audio.removeEventListener('loadeddata', updateDuration);
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const timelineWidth = window.getComputedStyle(e.currentTarget).width;
    const timeToSeek = (e.nativeEvent.offsetX / parseInt(timelineWidth)) * duration;
    audioRef.current.currentTime = timeToSeek;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const sliderWidth = window.getComputedStyle(e.currentTarget).width;
    const newVolume = e.nativeEvent.offsetX / parseInt(sliderWidth);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    if (audioPlayerRef.current) {
      const volumePercentage = audioPlayerRef.current.querySelector('.volume-percentage') as HTMLDivElement;
      volumePercentage.style.width = `${newVolume * 100}%`;
    }
  };

  const formatTime = (num: number): string => {
    let seconds = parseInt(num.toString());
    let minutes = parseInt((seconds / 60).toString());
    seconds -= minutes * 60;
    const hours = parseInt((minutes / 60).toString());
    minutes -= hours * 60;

    if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    return `${String(hours).padStart(2, '0')}:${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlaybackRate = parseFloat(e.target.value);
    setPlaybackRate(newPlaybackRate);
    audioRef.current.playbackRate = newPlaybackRate;
  };

  return (
    <div className="audio-player w-full" ref={audioPlayerRef}>
      <div className="timeline" onClick={handleTimelineClick}>
        <div className="progress"></div>
      </div>
      <div className="controls">
        <div className="play-container">
          <div className={`toggle-play ${isPlaying ? 'pause' : 'play'}`} onClick={togglePlay}></div>
        </div>
        <div className="time text-[#dadada]">
          <div className="current">{formatTime(currentTime)}</div>
          <div className="divider">/</div>
          <div className="length">{formatTime(duration)}</div>
        </div>

        <div className="speed-controls text-[#dadada]">
          <select className='p-2 bg-fluency-bg-dark rounded-md font-bold' id="speedSelect" value={playbackRate} onChange={handleSpeedChange}>
            <option value={0.5}>0.5x</option>
            <option value={1.0}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2.0}>2x</option>
          </select>
        </div>

        <div className="volume-container"> 
          <div className="volume-button">
            <HiVolumeUp className="volume icono-volumeMedium w-6 h-auto text-[#dadada]"/>
          </div>
          <div className="volume-slider" onClick={handleVolumeChange}>
            <div className="volume-percentage"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
