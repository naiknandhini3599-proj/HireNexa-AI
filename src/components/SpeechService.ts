// Web Speech API Voice and Audio Recognition Service

export class SpeechService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static audioCtx: AudioContext | null = null;
  private static analyser: AnalyserNode | null = null;
  private static micStream: MediaStream | null = null;

  private static currentAudioEl: HTMLAudioElement | null = null;

  // Speak text with server voice or fallback to browser speech synthesis
  public static async speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onViseme?: (intensity: number) => void
  ): Promise<void> {
    this.stopSpeaking();

    // 1. Try server high-definition voice (ElevenLabs) if available
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`);
        this.currentAudioEl = audio;
        let intervalId: any = null;

        audio.onplay = () => {
          if (onStart) onStart();
          if (onViseme) {
            intervalId = setInterval(() => {
              onViseme(Math.random() * 0.7 + 0.3);
            }, 100);
          }
        };

        audio.onended = () => {
          if (intervalId) clearInterval(intervalId);
          if (onViseme) onViseme(0);
          if (onEnd) onEnd();
        };

        audio.onerror = () => {
          if (intervalId) clearInterval(intervalId);
          if (onViseme) onViseme(0);
          this.fallbackBrowserSpeak(text, onStart, onEnd, onViseme);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser Web Speech API
    }

    this.fallbackBrowserSpeak(text, onStart, onEnd, onViseme);
  }

  private static fallbackBrowserSpeak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onViseme?: (intensity: number) => void
  ): void {
    if (!this.synth) {
      if (onStart) onStart();
      setTimeout(() => onEnd?.(), 2000);
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    let intervalId: any = null;

    utterance.onstart = () => {
      if (onStart) onStart();
      if (onViseme) {
        intervalId = setInterval(() => {
          onViseme(Math.random() * 0.7 + 0.3);
        }, 120);
      }
    };

    utterance.onend = () => {
      if (intervalId) clearInterval(intervalId);
      if (onViseme) onViseme(0);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (intervalId) clearInterval(intervalId);
      if (onViseme) onViseme(0);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public static stopSpeaking(): void {
    if (this.currentAudioEl) {
      this.currentAudioEl.pause();
      this.currentAudioEl = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }



  // Real browser speech-to-text recognition
  public static startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      onError?.('Speech recognition not natively supported in this browser. Please use Chrome, Edge, or Safari, or type in the response box.');
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          onResult(combined, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error !== 'no-speech') {
          onError?.(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      onError?.('Failed to access microphone for speech recognition.');
      return false;
    }
  }

  public static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  // Audio level meter using Web Audio API
  public static async startMicMeter(onLevel: (level: number) => void): Promise<() => void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      this.audioCtx = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let animId: number;

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 80);
        onLevel(normalized);
        animId = requestAnimationFrame(checkLevel);
      };

      animId = requestAnimationFrame(checkLevel);

      return () => {
        cancelAnimationFrame(animId);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();
      };
    } catch (err) {
      console.warn('Audio metering unavailable:', err);
      return () => {};
    }
  }
}
