import { useState, useEffect, useRef, useCallback } from 'react';

export type PreferredAccent = 'en-US' | 'en-GB' | 'en-AU';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [preferredAccent, setPreferredAccent] = useState<PreferredAccent>('en-US');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize available browser speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
      setAvailableVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlayingWordId(null);
  }, []);

  const playTTS = useCallback((text: string, wordId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackRate;

    // Pick best matching voice based on accent preference
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === preferredAccent.toLowerCase()) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayingWordId(wordId || text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setPlayingWordId(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setPlayingWordId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [playbackRate, preferredAccent]);

  const play = useCallback((word: string, audioUrl?: string, wordId?: string) => {
    stop();

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.playbackRate = playbackRate;
        currentAudioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setPlayingWordId(wordId || word);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setPlayingWordId(null);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn(`Audio URL failed to play (${audioUrl}), falling back to SpeechSynthesis.`);
          currentAudioRef.current = null;
          playTTS(word, wordId);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((_err) => {
            // Autoplay restriction or network error -> fallback to TTS
            playTTS(word, wordId);
          });
        }
      } catch {
        playTTS(word, wordId);
      }
    } else {
      playTTS(word, wordId);
    }
  }, [playbackRate, playTTS, stop]);

  return {
    isPlaying,
    playingWordId,
    preferredAccent,
    setPreferredAccent,
    playbackRate,
    setPlaybackRate,
    availableVoices,
    play,
    stop,
  };
}
