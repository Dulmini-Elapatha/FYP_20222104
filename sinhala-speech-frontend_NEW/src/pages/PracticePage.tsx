import { useState, useRef, useEffect } from 'react' // <-- Added useEffect here
import { useAuth } from '../context/AuthContext'
import api from '../api'
import ScoreRing from '../components/ScoreRing'
import PageHeader from '../components/PageHeader'
import {
  Mic, MicOff, RotateCcw, ChevronRight, Brain, Volume2, Loader2,
} from 'lucide-react'

interface Exercise {
  word: string
  translation: string
  difficulty: string
  phonetic?: string
}

interface AnalysisResult {
  score: number
  exercise: Exercise
  reward?: number
  feedback?: string
  heard_text?: string
  attempted_target?: string
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '● Easy', medium: '◆ Medium', hard: '▲ Hard',
}

// Waveform bars animation
function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${active ? 'bg-teal-400' : 'bg-white/10'}`}
          style={{
            height: active ? `${20 + Math.random() * 60}%` : '20%',
            animationName: active ? 'waveBar' : 'none',
            animationDuration: `${0.4 + (i % 5) * 0.1}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const result = new Float32Array(buffer.length * numChannels);
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < buffer.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result.set(buffer.getChannelData(0));
  }

  const dataLength = result.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    let s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function PracticePage() {
  const [recording, setRecording] = useState(false)
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [practiced, setPracticed] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // CLEANUP: Removed LocalStorage reads. Default strictly to Level 1.
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState("මම");
  const [targetPhonemes, setTargetPhonemes] = useState("ma ma");

  // NEW: Watch for user changes and reset the room securely!
  useEffect(() => {
    setCurrentLevel(1);
    setCurrentWord("මම");
    setTargetPhonemes("ma ma");
    setResult(null); 
    setPracticed(0); 
  }, [user?.email]);

  async function startRecording() {
    setError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      
      recorder.onstop = async () => {
        try {
          const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const arrayBuffer = await webmBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const trueWavBlob = audioBufferToWavBlob(audioBuffer);
          
          await sendAudio(trueWavBlob)
        } catch (err) {
          console.error("Audio Conversion Error:", err)
          setError("Audio too short or unreadable. Please try speaking a bit longer.")
          setLoading(false)
        } finally {
          stream.getTracks().forEach(t => t.stop())
        }
      }
      
      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setError('Microphone access denied. Please allow microphone access.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
    setLoading(true)
  }

  async function sendAudio(blob: Blob) {
    const attemptedPhonemes = targetPhonemes;
    const attemptedWord = currentWord;

    try {
      const form = new FormData();
      form.append('audio_file', blob, 'recording.wav');
      form.append('current_level', currentLevel.toString());
      form.append('target_phonemes', attemptedPhonemes);
      form.append('user_email', user?.email || 'test@example.com')
      form.append('attempted_word', currentWord)

      const res = await api.post<any>('/process_turn', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // CLEANUP: Removed LocalStorage writing! The backend saves it to SQLite now.

      setResult({
        score: res.data.previous_score,
        exercise: {
          word: res.data.next_word_to_show,
          translation: `Level ${res.data.new_level} Challenge`,
          difficulty: res.data.new_level <= 2 ? 'easy' : res.data.new_level <= 4 ? 'medium' : 'hard',
          phonetic: res.data.next_target_phonemes
        },
        reward: res.data.ai_action_taken === 2 ? 1 : res.data.ai_action_taken === 0 ? -1 : 0,
        heard_text: res.data.heard_text,
        attempted_target: attemptedPhonemes
      });

      setCurrentLevel(res.data.new_level);
      setTargetPhonemes(res.data.next_target_phonemes);
      setCurrentWord(res.data.next_word_to_show);
      setPracticed(p => p + 1);

    } catch (err) {
      console.error("API Error:", err);
      setError('Analysis failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null)
    setError('')
  }

  const scoreFeedback = (s: number) => {
    if (s >= 0.85) return { text: 'Excellent! 🎉', sub: 'Outstanding pronunciation', color: 'text-teal-400' }
    if (s >= 0.7) return { text: 'Great job! 👍', sub: 'Good pronunciation', color: 'text-teal-400' }
    if (s >= 0.5) return { text: 'Keep going! 💪', sub: 'Room for improvement', color: 'text-amber-400' }
    return { text: 'Try again! 🔄', sub: 'Needs more practice', color: 'text-red-400' }
  }

  return (
    <div>
      <PageHeader title="Practice Room" subtitle="Record yourself speaking a Sinhala word and get instant feedback" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording panel */}
        <div className="card p-8 flex flex-col items-center text-center animate-fade-up">
          <h2 className="font-display font-semibold text-white mb-1">Record Pronunciation</h2>
          <p className="text-white/40 text-sm mb-6">Press the mic, speak clearly, then press stop</p>

          <div className="mb-8 p-6 w-full rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <p className="text-sm text-teal-400 font-semibold mb-2 uppercase tracking-widest">Please Say:</p>
            <p className="text-5xl font-display font-bold text-white">{currentWord}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 w-full">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Big mic button */}
          <div className="relative mb-8">
            {recording && (
              <>
                <div className="ping-ring absolute inset-[-16px] rounded-full border-2 border-teal-400/40" />
                <div className="ping-ring absolute inset-[-32px] rounded-full border border-teal-400/20" style={{ animationDelay: '0.3s' }} />
              </>
            )}
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                recording
                  ? 'bg-red-500 hover:bg-red-400 scale-110'
                  : loading
                  ? 'bg-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-br from-teal-400 to-teal-600 hover:scale-105 hover:shadow-teal-500/25'
              }`}
              style={recording ? { boxShadow: '0 0 40px rgba(239,68,68,0.4)' } : {}}
            >
              {loading
                ? <Loader2 className="w-10 h-10 text-white animate-spin" />
                : recording
                ? <MicOff className="w-10 h-10 text-white" />
                : <Mic className="w-10 h-10 text-white" />
              }
            </button>
          </div>

          {/* Waveform */}
          <div className="mb-6 w-full flex justify-center">
            <WaveformBars active={recording} />
          </div>

          <p className="text-sm font-medium text-white/50">
            {loading ? 'Analyzing your pronunciation...'
              : recording ? 'Recording... tap to stop'
              : 'Tap to start recording'}
          </p>

          {practiced > 0 && (
            <div className="mt-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
              {practiced} recording{practiced !== 1 ? 's' : ''} this session
            </div>
          )}
        </div>

        {/* Result panel */}
        <div className="flex flex-col gap-6">
          {!result ? (
            <div className="card p-8 flex flex-col items-center justify-center h-full text-center animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Volume2 className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">Your score will appear here after recording</p>
            </div>
          ) : (
            <>
              {/* Score card */}
              <div className="card p-6 animate-fade-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-white">Your Result</h3>
                  
                  <button onClick={reset} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
                    <RotateCcw className="w-3 h-3" /> New recording
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <ScoreRing score={result.score} size={110} />
                  <div>
                    <p className={`text-lg font-display font-bold ${scoreFeedback(result.score).color}`}>
                      {scoreFeedback(result.score).text}
                    </p>
                    <p className="text-white/40 text-sm mb-1">{scoreFeedback(result.score).sub}</p>
                    
                    {/* NEW: THE DIAGNOSTIC BOX IS HERE */}
                    <div className="mt-3 mb-2 p-2.5 rounded-lg bg-black/20 border border-white/5 text-xs font-mono shadow-inner">
                      <p className="text-white/50">🎯 Target: /{result.attempted_target}/</p>
                      <p className="text-amber-400 mt-1">🤖 Heard:  /{result.heard_text || 'Nothing heard'}/</p>
                    </div>

                    {result.reward !== undefined && (
                      <div className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        result.reward > 0 ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.reward > 0 ? '↑' : '↓'} RL Reward: {result.reward > 0 ? '+' : ''}{result.reward}
                      </div>
                    )}
                  </div>
                </div>
                {result.feedback && (
                  <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-white/50">
                    {result.feedback}
                  </div>
                )}
              </div>

              {/* Next exercise */}
              <div className="card p-6 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">RL Agent — Next Exercise</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-display font-bold text-white mt-1">{result.exercise?.word}</p>
                    <p className="text-white/40 text-sm mt-1">{result.exercise?.translation}</p>
                    {result.exercise?.phonetic && (
                      <p className="text-white/25 text-xs mt-0.5 font-mono">/{result.exercise.phonetic}/</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${DIFFICULTY_COLOR[result.exercise?.difficulty ?? 'easy'] ?? DIFFICULTY_COLOR.easy}`}>
                    {DIFFICULTY_LABEL[result.exercise?.difficulty ?? 'easy'] ?? result.exercise?.difficulty}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6 mt-6 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <h3 className="font-display font-semibold text-white mb-3">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', text: 'Press the microphone button', color: 'bg-teal-500' },
            { step: '2', text: 'Speak a Sinhala word clearly', color: 'bg-amber-500' },
            { step: '3', text: 'Press stop & get your score', color: 'bg-purple-500' },
            { step: '4', text: 'RL agent picks your next word', color: 'bg-teal-500' },
          ].map(({ step, text, color }) => (
            <div key={step} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5`}>
                {step}
              </div>
              <p className="text-sm text-white/50">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}