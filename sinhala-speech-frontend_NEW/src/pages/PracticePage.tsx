import { useState, useRef } from 'react'
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

export default function PracticePage() {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [practiced, setPracticed] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    setError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await sendAudio(blob)
        stream.getTracks().forEach(t => t.stop())
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
    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')
      const res = await api.post<AnalysisResult>('/speech/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setPracticed(p => p + 1)
    } catch {
      setError('Analysis failed. Make sure the backend server is running.')
    } finally {
      setLoading(false)
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
          <p className="text-white/40 text-sm mb-8">Press the mic, speak a Sinhala word clearly, then press stop</p>

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
                    <p className="text-white/40 text-sm">{scoreFeedback(result.score).sub}</p>
                    {result.reward !== undefined && (
                      <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
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
