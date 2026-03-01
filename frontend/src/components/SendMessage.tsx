import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { upload, uploadFile, uploadToPinata } from '../lib/ipfs'
import { aptos } from '../config'
import EmojiPicker from './EmojiPicker'
import FileUpload from './FileUpload'
import GiphyPicker from './GiphyPicker'
import { Spinner } from './ui'
import { useMetrics } from './PerformanceDashboard'
import ChatComposer from './ChatComposer'

const normalizeAddress = (addr: string) => {
  if (!addr) return addr
  const clean = addr.trim().startsWith('0x') ? addr.trim().slice(2) : addr.trim()
  return '0x' + clean.padStart(64, '0')
}

export interface ProcessedMessage {
  sender: string;
  content: string;
  timestamp: number;
  read: boolean;
  id: number;
  cid: string;
  type?: 'text' | 'audio';
  plain?: string;
}

interface SendMessageProps {
  contractAddress: string
  onMessageSent: () => void
  onClose?: () => void
  initialRecipient?: string
}

interface AttachedFile {
  url: string
  type: 'image' | 'file' | 'video'
  name: string
  id: string
}

export default function SendMessage({ contractAddress, onMessageSent, onClose, initialRecipient }: SendMessageProps) {
  const { account, signAndSubmitTransaction } = useWallet()
  const [recipient, setRecipient] = useState(initialRecipient ?? '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showGiphy, setShowGiphy] = useState(false)
  const [selectedGif, setSelectedGif] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const { incrementMessagesSent, addDataUsage } = useMetrics()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setRecordingTime(0)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  useEffect(() => {
    if (initialRecipient && initialRecipient !== recipient) {
      setRecipient(initialRecipient)
    }
  }, [initialRecipient, recipient])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      const options = { mimeType: 'audio/webm;codecs=opus' }
      let mediaRecorder: MediaRecorder

      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mediaRecorder = new MediaRecorder(stream, options)
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      } else {
        mediaRecorder = new MediaRecorder(stream)
      }

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        stream.getTracks().forEach(track => track.stop())
        await sendAudioMessage(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!account || !recipient.trim()) {
      alert('Please enter a recipient address first')
      return
    }

    setLoading(true)
    setCurrentStep('Checking recipient...')

    try {
      const normalizedRecipient = normalizeAddress(recipient)
      const existsRes = await aptos.view({
        payload: {
          function: `${contractAddress}::Inbox3::inbox_exists`,
          functionArguments: [normalizedRecipient]
        }
      })

      if (!existsRes[0]) {
        throw new Error('3')
      }

      const audioCid = await uploadFile(audioBlob)
      const audioUrl = `https://gateway.pinata.cloud/ipfs/${audioCid}`
      addDataUsage(audioBlob.size)

      const metadataCid = await uploadToPinata(audioUrl, account.address.toString(), 'audio')

      setCurrentStep('Storing on blockchain...')

      const response = await signAndSubmitTransaction({
        data: {
          function: `${contractAddress}::Inbox3::send_message`,
          typeArguments: [],
          functionArguments: [normalizeAddress(recipient), Array.from(new TextEncoder().encode(metadataCid))]
        }
      })

      await aptos.waitForTransaction({ transactionHash: response.hash })

      incrementMessagesSent()
      setCurrentStep('Audio message sent!')
      setTimeout(() => setCurrentStep(''), 3000)
      onMessageSent()
    } catch (error) {
      console.error('Error sending audio:', error)
      alert('Failed to send audio message')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !recipient.trim() || (!message.trim() && !selectedGif && attachedFiles.length === 0 && !isRecording)) return

    setLoading(true)
    setCurrentStep('Checking recipient...')

    try {
      const normalizedRecipient = normalizeAddress(recipient)
      const existsRes = await aptos.view({
        payload: {
          function: `${contractAddress}::Inbox3::inbox_exists`,
          functionArguments: [normalizedRecipient]
        }
      })

      if (!existsRes[0]) {
        throw new Error('3')
      }

      setCurrentStep('Encrypting message...')

      let finalContent = message

      if (selectedGif) {
        finalContent = finalContent ? `${finalContent}\n![GIF](${selectedGif})` : `![GIF](${selectedGif})`
      }

      attachedFiles.forEach(file => {
        const md = file.type === 'image'
          ? `![${file.name}](${file.url})`
          : file.type === 'video'
            ? `[Video: ${file.name}](${file.url})`
            : `[${file.name}](${file.url})`
        finalContent = finalContent ? `${finalContent}\n${md}` : md
      })

      await handleSend(finalContent)

    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (content: string) => {
    if (!account || !recipient.trim() || !content.trim()) return

    setLoading(true)
    setCurrentStep('Checking recipient...')

    try {
      const normalizedRecipient = normalizeAddress(recipient)
      const existsRes = await aptos.view({
        payload: {
          function: `${contractAddress}::Inbox3::inbox_exists`,
          functionArguments: [normalizedRecipient]
        }
      })

      if (!existsRes[0]) {
        throw new Error('3')
      }

      setCurrentStep('Encrypting block...')

      const messageData = {
        sender: account.address.toString(),
        content: content,
        timestamp: Date.now(),
        type: 'text'
      }

      setCurrentStep('Syncing to IPFS...')
      const cid = await upload(JSON.stringify(messageData))
      addDataUsage(new Blob([JSON.stringify(messageData)]).size)

      setCurrentStep('Validating...')
      const response = await signAndSubmitTransaction({
        data: {
          function: `${contractAddress}::Inbox3::send_message`,
          typeArguments: [],
          functionArguments: [normalizeAddress(recipient), Array.from(new TextEncoder().encode(cid))]
        }
      })

      await aptos.waitForTransaction({ transactionHash: response.hash })
      incrementMessagesSent()

      setCurrentStep('Sent!')
      setTimeout(() => setCurrentStep(''), 2000)

      onMessageSent()
    } catch (error) {
      console.error('Error sending message:', error)
      let errorMessage = 'Failed to send message'
      if (error instanceof Error) {
        if (error.message.includes('3')) {
          errorMessage = 'The recipient does not have an inbox yet.'
        } else if (error.message.includes('insufficient')) {
          errorMessage = 'Insufficient balance.'
        }
      }
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isCompactMode = !!initialRecipient && initialRecipient.trim().length > 5

  if (isCompactMode) {
    return (
      <div className="flex flex-col border-t border-(--border-color)/30 bg-(--bg-card)/50 backdrop-blur-xl group relative">
        {loading && currentStep && (
          <div className="absolute top-0 left-0 right-0 -translate-y-full px-5 py-2 flex items-center gap-3 bg-gradient-to-r from-blue-600/90 to-blue-500/90 backdrop-blur-md text-white z-50">
            <Spinner size="xs" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentStep}</span>
          </div>
        )}
        <ChatComposer
          onSend={handleSend}
          onSendAudio={sendAudioMessage}
          disabled={loading}
          placeholder="Type your secure message..."
        />
        <div className="px-5 py-2 border-t border-(--border-color)/20 flex justify-between items-center opacity-60">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/10">
            <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-green-600">E2E Secured Connection</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-(--text-muted)">Aptos Network Layer</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-(--bg-card)/20 backdrop-blur-xl rounded-[2.5rem] border border-(--border-color)/30 shadow-2xl overflow-hidden animate-scale-in">
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-(--text-primary) tracking-tight">New Secure Channel</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60">Quantum-Resistant Layer</p>
              </div>
            </div>
            {onClose && (
              <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 hover:dark:bg-white/5 transition-all text-(--text-muted)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-(--text-muted) opacity-70">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x... (Aptos Address)"
                className="w-full px-5 py-4 bg-(--bg-secondary)/50 border border-(--border-color)/40 rounded-2xl focus:border-(--primary-brand) outline-none transition-all text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-(--text-muted) opacity-70">Message Content</label>
              <div className="relative flex flex-col min-h-0 bg-(--bg-secondary)/30 border border-(--border-color)/40 rounded-[1.5rem] focus-within:border-(--primary-brand) transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Start your conversation privately..."
                  className="w-full min-h-[160px] px-5 py-4 bg-transparent text-(--text-primary) outline-none text-sm resize-none custom-scrollbar"
                  required={!isRecording && !selectedGif && attachedFiles.length === 0}
                  disabled={isRecording}
                />

                {(selectedGif || attachedFiles.length > 0) && (
                  <div className="px-5 pb-4 flex flex-wrap gap-3 animate-scale-in">
                    {selectedGif && (
                      <div className="relative group">
                        <img src={selectedGif} className="h-20 w-auto rounded-lg border-2 border-orange-500/30 shadow-sm" alt="GIF" />
                        <button type="button" onClick={() => setSelectedGif(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                      </div>
                    )}
                    {attachedFiles.map(file => {
                      const isImg = file.type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)/i.test(file.name);
                      const isVid = file.type === 'video' || /\.(mp4|webm|ogg|mov|quicktime)/i.test(file.name);
                      return (
                        <div key={file.id} className="relative group">
                          {isImg ? (
                            <img src={file.url} className="h-20 w-auto rounded-lg border-2 border-orange-500/30 shadow-sm" alt="img" />
                          ) : isVid ? (
                            <div className="h-20 aspect-video rounded-lg bg-black/20 border-2 border-orange-500/30 flex items-center justify-center relative overflow-hidden">
                              <video src={file.url} className="w-full h-full object-cover" />
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="absolute z-10"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-black/10 flex items-center justify-center text-(--text-muted)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg></div>
                          )}
                          <button type="button" onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 border-t border-(--border-color)/20">
                  <EmojiPicker onSelect={(emoji) => setMessage(prev => prev + emoji)} position="top" />
                  <FileUpload disabled={loading || isRecording} onFileUploaded={async (url, type, fileName) => {
                    setAttachedFiles(prev => [...prev, { url, type, name: fileName, id: Math.random().toString(36).substr(2, 9) }])
                  }} />
                  <button type="button" onClick={() => setShowGiphy(!showGiphy)} className={`px-4 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all ${showGiphy ? 'bg-orange-500 text-white' : 'hover:bg-black/5 text-(--text-muted) border border-(--border-color)/40'}`}>GIF</button>
                  {showGiphy && (
                    <div className="absolute bottom-full left-0 mb-4 z-50">
                      <GiphyPicker onSelect={(url) => { setSelectedGif(url); setShowGiphy(false); }} onClose={() => setShowGiphy(false)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/5 border border-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">E2E Secure</span>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 ring-8 ring-red-500/10'
                  : 'bg-(--bg-secondary) border border-(--border-color)/50 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30'}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white shadow-[0_0_10px_white]' : 'bg-red-500'} animate-pulse`} />
                {isRecording ? formatTime(recordingTime) : 'Encrypted Audio'}
              </button>

              <button
                type="submit"
                disabled={loading || !recipient || (!message.trim() && !isRecording && !selectedGif && attachedFiles.length === 0)}
                className="flex items-center gap-3 px-10 py-4 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.15em] shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/60 hover:-translate-y-1.5 transition-all disabled:opacity-40 disabled:grayscale disabled:translate-y-0 active:scale-95"
              >
                {!loading ? (
                  <>
                    <span className="drop-shadow-md">Broadcast Message</span>
                    <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                        <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Spinner size="sm" />
                    <span className="text-xs">Securing...</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
