import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  setVolume: (volume: number) => Promise<void>;
  addListener: (event: string, callback: (data: any) => void) => boolean;
  removeListener: (event: string) => boolean;
  activateElement: () => Promise<void>;
}

interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      id: string;
      uri: string;
      name: string;
      artists: { name: string }[];
    };
  };
}

interface UseSpotifyPlayerReturn {
  player: SpotifyPlayer | null;
  deviceId: string | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: string | null;
  progress: number;
  duration: number;
  play: (spotifyUri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

let sdkScriptLoaded = false;
let sdkReadyCallbacks: (() => void)[] = [];

function loadSpotifySdk(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    sdkReadyCallbacks.push(resolve);

    if (!sdkScriptLoaded) {
      sdkScriptLoaded = true;
      
      window.onSpotifyWebPlaybackSDKReady = () => {
        sdkReadyCallbacks.forEach(cb => cb());
        sdkReadyCallbacks = [];
      };

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

export function useSpotifyPlayer(accessToken: string | null): UseSpotifyPlayerReturn {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);

  // Initialize player when token is available
  useEffect(() => {
    if (!accessToken) {
      // Clean up player if token is removed
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setPlayer(null);
        setDeviceId(null);
        setIsReady(false);
      }
      return;
    }

    let isMounted = true;

    async function initPlayer() {
      await loadSpotifySdk();

      if (!isMounted || !accessToken) return;

      const newPlayer = new window.Spotify.Player({
        name: 'TuneStory Web Player',
        getOAuthToken: (callback) => {
          callback(accessToken);
        },
        volume: 0.5,
      });

      // Error handling
      newPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Spotify initialization error:', message);
      });

      newPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Spotify authentication error:', message);
        toast({
          title: 'Spotify Authentication Error',
          description: 'Please reconnect your Spotify account.',
          variant: 'destructive',
        });
      });

      newPlayer.addListener('account_error', ({ message }) => {
        console.error('Spotify account error:', message);
        toast({
          title: 'Spotify Premium Required',
          description: 'Full playback requires Spotify Premium. Using previews instead.',
          variant: 'default',
        });
      });

      newPlayer.addListener('playback_error', ({ message }) => {
        console.error('Spotify playback error:', message);
      });

      // Ready
      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify player ready with device ID:', device_id);
        if (isMounted) {
          setDeviceId(device_id);
          setIsReady(true);
        }
      });

      // Not ready
      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Spotify player not ready:', device_id);
        if (isMounted) {
          setIsReady(false);
        }
      });

      // State changes
      newPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
        if (!state || !isMounted) return;

        setIsPlaying(!state.paused);
        setProgress(state.position);
        setDuration(state.duration);
        
        if (state.track_window?.current_track) {
          setCurrentTrack(state.track_window.current_track.id);
        }
      });

      const connected = await newPlayer.connect();
      if (connected && isMounted) {
        playerRef.current = newPlayer;
        setPlayer(newPlayer);
      }
    }

    initPlayer();

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [accessToken]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && player) {
      progressIntervalRef.current = setInterval(async () => {
        const state = await player.getCurrentState();
        if (state) {
          setProgress(state.position);
          setDuration(state.duration);
        }
      }, 1000);
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, player]);

  const play = useCallback(async (spotifyUri: string) => {
    if (!deviceId || !accessToken) {
      console.error('No device ID or access token');
      return;
    }

    try {
      // Extract track ID from various formats
      let trackUri = spotifyUri;
      if (!trackUri.startsWith('spotify:track:')) {
        // It's just the ID
        trackUri = `spotify:track:${spotifyUri}`;
      }

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [trackUri],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Spotify play error:', error);
        
        if (error.error?.reason === 'PREMIUM_REQUIRED') {
          toast({
            title: 'Spotify Premium Required',
            description: 'Full playback requires Spotify Premium.',
            variant: 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }, [deviceId, accessToken]);

  const pause = useCallback(async () => {
    if (player) {
      await player.pause();
    }
  }, [player]);

  const resume = useCallback(async () => {
    if (player) {
      await player.resume();
    }
  }, [player]);

  const togglePlay = useCallback(async () => {
    if (player) {
      await player.togglePlay();
    }
  }, [player]);

  return {
    player,
    deviceId,
    isReady,
    isPlaying,
    currentTrack,
    progress,
    duration,
    play,
    pause,
    resume,
    togglePlay,
  };
}
