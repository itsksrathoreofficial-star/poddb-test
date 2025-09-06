"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from './PlayerProvider';

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const AudioPlayer = ({ videoId }: { videoId: string }) => {
    const { play, pause, isPlaying: isGlobalPlaying } = usePlayer();
    const [player, setPlayer] = useState<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const loadYouTubeAPI = () => {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                window.onYouTubeIframeAPIReady = () => loadPlayer(videoId);
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
            } else {
                loadPlayer(videoId);
            }
        };

        loadYouTubeAPI();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (player) {
                try {
                    player.destroy();
                } catch (e) {
                    console.error("Error destroying YouTube player", e);
                }
            }
        };
    }, [videoId, player]);

    const loadPlayer = (currentVideoId: string) => {
        if (player) {
            try {
              player.destroy();
            } catch(e) {}
        }
        if (playerContainerRef.current) {
            const newPlayer = new window.YT.Player(playerContainerRef.current, {
                height: '0',
                width: '0',
                videoId: currentVideoId,
                playerVars: { 'autoplay': 0, 'controls': 0, 'origin': window.location.origin },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            setPlayer(newPlayer);
        }
    };

    const onPlayerReady = (event: any) => {
        setDuration(event.target.getDuration());
        setIsReady(true);
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                if (player && typeof player.getCurrentTime === 'function') {
                    const currentTime = player.getCurrentTime();
                    setProgress(currentTime);
                }
            }, 500);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    };

    const handlePlayPause = () => {
        if (!isReady || !player) return;
        if (isGlobalPlaying) {
            pause();
            player.pauseVideo();
        } else {
            play({ id: videoId, title: '', youtube_video_id: videoId });
            player.playVideo();
        }
    };

    const handleSeek = (value: number[]) => {
        if (!isReady || !player) return;
        const newTime = value[0];
        player.seekTo(newTime, true);
        setProgress(newTime);
    };
    
    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="p-4 rounded-lg space-y-3">
             <div ref={playerContainerRef}></div>
             <Slider
                value={[progress]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                disabled={!isReady}
             />
             <div className="flex justify-between items-center text-xs">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
             </div>
             <div className="flex justify-center items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => handleSeek([Math.max(0, progress - 10)])} disabled={!isReady}><Rewind/></Button>
                <Button size="lg" className="rounded-full w-16 h-16" onClick={handlePlayPause} disabled={!isReady}>
                    {isGlobalPlaying ? <Pause size={24}/> : <Play size={24} className="ml-1"/>}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSeek([Math.min(duration, progress + 10)])} disabled={!isReady}><FastForward/></Button>
             </div>
        </div>
    );
};

export default AudioPlayer;
