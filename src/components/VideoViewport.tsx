import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Camera, 
  RotateCcw, 
  UploadCloud, 
  Video, 
  Radio, 
  FileCheck,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { StreamSourceMode, EmotionType } from '../types';

interface VideoViewportProps {
  isStreaming: boolean;
  onToggleStreaming: (start: boolean) => void;
  onCaptureSnapshot: () => void;
  onResetBuffer: () => void;
  confThreshold: number;
  onChangeConfThreshold: (val: number) => void;
  currentConfidence: number;
  currentEmotion: EmotionType;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onSelectSimulatedEmotion: (emotion: EmotionType) => void;
}

export const VideoViewport: React.FC<VideoViewportProps> = ({
  isStreaming,
  onToggleStreaming,
  onCaptureSnapshot,
  onResetBuffer,
  confThreshold,
  onChangeConfThreshold,
  currentConfidence,
  currentEmotion,
  onShowToast,
  onSelectSimulatedEmotion,
}) => {
  const [sourceTab, setSourceTab] = useState<'live' | 'static'>('live');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [staticMedia, setStaticMedia] = useState<{ url: string; name: string; type: 'image' | 'video' } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subtle realistic landmark jitter simulation when streaming
  const [jitterOffset, setJitterOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      // micro-jitter: ±0.3%
      setJitterOffset({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
      });
    }, 180);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Webcam stream management
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        onShowToast('Webcam hardware connected: /dev/video0', 'success');
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      onShowToast('Camera access denied or unavailable. Using RTSP stream feed.', 'warning');
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  const handleToggleWebcam = () => {
    if (isWebcamActive) {
      stopWebcam();
      onShowToast('Reverted to calibrated RTSP stream pipeline', 'info');
    } else {
      startWebcam();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);
    setStaticMedia({
      url: objectUrl,
      name: file.name,
      type: isVideo ? 'video' : 'image',
    });
    onShowToast(`Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB) for tensor parsing.`, 'success');
  };

  const isBboxVisible = isStreaming && currentConfidence >= confThreshold;

  return (
    <section className="flex flex-col gap-3" data-purpose="viewport-section">
      {/* Stream Mode Segmented Tabs & Source Toggle */}
      <div className="flex items-center justify-between bg-white border border-[#E2E8F0] p-1 rounded-md text-xs font-mono shadow-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSourceTab('live');
              onShowToast('Switched to Live Stream Ingest feed', 'info');
            }}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${
              sourceTab === 'live'
                ? 'bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] font-semibold shadow-sm'
                : 'text-slate-600 hover:text-[#7E22CE] hover:bg-[#FAF5FF]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#9333EA] animate-pulse' : 'bg-slate-400'}`}></span>
            Live Stream (Webcam / RTSP)
          </button>

          <button
            onClick={() => {
              setSourceTab('static');
              onShowToast('Switched to Static Media Upload mode', 'info');
            }}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${
              sourceTab === 'static'
                ? 'bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] font-semibold shadow-sm'
                : 'text-slate-600 hover:text-[#7E22CE] hover:bg-[#FAF5FF]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Static Media Upload (MP4, AVI, PNG, JPG)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {sourceTab === 'live' && (
            <button
              onClick={handleToggleWebcam}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                isWebcamActive 
                  ? 'bg-purple-100 border-[#9333EA] text-[#7E22CE] font-semibold' 
                  : 'bg-white hover:bg-[#FAF5FF] border-[#E2E8F0] text-slate-700'
              }`}
              title={isWebcamActive ? 'Switch back to RTSP Sample Feed' : 'Use your computer webcam'}
            >
              <Video className="w-3 h-3 text-[#9333EA]" />
              <span>{isWebcamActive ? 'Using Real Webcam' : 'Use Real Webcam'}</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-2 text-[11px] text-slate-500 font-medium">
            <span>RES: 1080P</span>
            <span className="text-slate-300">|</span>
            <span>COLOR: RGB</span>
          </div>
        </div>
      </div>

      {/* Viewport Container with 16:9 Relative Ratio */}
      <div 
        className="relative bg-slate-900 border border-[#E2E8F0] rounded-md overflow-hidden aspect-video flex items-center justify-center shadow-md ring-1 ring-black/5 select-none"
        data-purpose="viewport-display"
      >
        {sourceTab === 'live' ? (
          <div className="relative w-full h-full">
            {/* Feed Image or Live Camera Stream */}
            {isWebcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover object-center transform -scale-x-100 ${
                  !isStreaming ? 'opacity-40 grayscale filter' : ''
                }`}
              />
            ) : (
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1WkUMzazXyiCQ1rswIwmEjPegHNUwu8Yu6jBTSHhK9CkEdl4eZG8sk9rXHQqwi4pYH-zBRyApD4_GvMZKkTHmcmulIypeDKRCQIsDYDsODrXTOygyWbT9SLDzkkyRsKvUmX8cdU_L6jiyR39Hn1DvJuXy9MXkFjc_2icLPBW1p5wL9C4Yd0zSWb16xXaMNLFaa6NK_wPpQYEeSi3qnqDhrU2KxW97x17jZ80a416-yIQ2QwoMr1zKAhENw"
                alt="Laboratory subject facial expression feed"
                className={`w-full h-full object-cover object-center transition-all duration-300 ${
                  !isStreaming ? 'opacity-40 grayscale filter' : ''
                }`}
              />
            )}

            {/* Top Overlaid Stream Metadata Watermark */}
            <div className="absolute top-2 left-3 bg-white/90 border border-[#E9D5FF] px-2.5 py-1 rounded text-[10px] font-mono text-slate-800 flex items-center gap-2 backdrop-blur-md pointer-events-none shadow-sm z-10">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`}></span>
              <span className="font-medium">
                {isWebcamActive ? 'DEV_00 [/dev/video0 · WEBCAM]' : 'CAM_01 [RTSP://192.168.1.104/LIVE]'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">RAW 1080P60</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">SENSOR: {isWebcamActive ? 'SYSTEM-UVC' : 'SONY-IMX477'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-[#9333EA] font-semibold">VOLATILE BUFFER</span>
            </div>

            {/* Coordinate Scale Crosshair Reticles (Center Screen) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                <line strokeWidth="1" x1="50" x2="50" y1="20" y2="40" />
                <line strokeWidth="1" x1="50" x2="50" y1="60" y2="80" />
                <line strokeWidth="1" x1="20" x2="40" y1="50" y2="50" />
                <line strokeWidth="1" x1="60" x2="80" y1="50" y2="50" />
                <circle cx="50" cy="50" r="15" strokeDasharray="2,2" strokeWidth="1" />
              </svg>
            </div>

            {/* Face Bounding Box & Landmark Overlay Layer */}
            {isStreaming && (
              <div
                className={`absolute border-2 transition-all duration-150 pointer-events-none ${
                  isBboxVisible
                    ? 'border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.35)] opacity-100'
                    : 'border-slate-400/50 opacity-20'
                }`}
                style={{
                  left: `${39 + jitterOffset.x}%`,
                  top: `${14 + jitterOffset.y}%`,
                  width: '21%',
                  height: '39%',
                }}
              >
                {/* Reticle Corner Accent Brackets */}
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#C084FC]"></span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#C084FC]"></span>
                <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#C084FC]"></span>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#C084FC]"></span>

                {/* Detection Label Tag attached to top border */}
                <div className="absolute -top-6 left-0 bg-[#FAF5FF]/95 border border-[#C084FC] text-[#6B21A8] text-[10px] font-mono px-2 py-0.5 whitespace-nowrap flex items-center gap-1.5 shadow-md rounded-t">
                  <span className="font-bold text-[#6B21A8] tracking-wider uppercase">
                    {currentEmotion}: {(currentConfidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-[#9333EA] text-[9px] font-medium">
                    CONF: {currentConfidence.toFixed(3)}
                  </span>
                  <span className="text-slate-500 text-[9px]">ID: #0412</span>
                </div>

                {/* Micro Facial Landmark Keypoints */}
                {/* Left Eye */}
                <span className="absolute left-[30%] top-[42%] w-1.5 h-1.5 rounded-full bg-[#C084FC] ring-2 ring-white/80 -translate-x-1/2 -translate-y-1/2 animate-pulse"></span>
                {/* Right Eye */}
                <span className="absolute left-[68%] top-[42%] w-1.5 h-1.5 rounded-full bg-[#C084FC] ring-2 ring-white/80 -translate-x-1/2 -translate-y-1/2 animate-pulse"></span>
                {/* Nose Bridge */}
                <span className="absolute left-[49%] top-[56%] w-1.5 h-1.5 rounded-full bg-[#A855F7] ring-2 ring-white/80 -translate-x-1/2 -translate-y-1/2"></span>
                {/* Mouth Left Anchor */}
                <span className="absolute left-[36%] top-[74%] w-1 h-1 rounded-full bg-[#E9D5FF] -translate-x-1/2 -translate-y-1/2"></span>
                {/* Mouth Right Anchor */}
                <span className="absolute left-[63%] top-[74%] w-1 h-1 rounded-full bg-[#E9D5FF] -translate-x-1/2 -translate-y-1/2"></span>
                {/* Mouth Center */}
                <span className="absolute left-[49%] top-[77%] w-1 h-1 rounded-full bg-[#C084FC] -translate-x-1/2 -translate-y-1/2"></span>

                {/* Dimensions Subtext */}
                <div className="absolute bottom-1 right-1 font-mono text-[8px] text-[#6B21A8] bg-white/90 border border-[#E9D5FF] px-1 rounded shadow-sm">
                  284x342 px
                </div>
              </div>
            )}

            {/* Low Confidence Filter Warning */}
            {isStreaming && !isBboxVisible && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500/90 text-white font-mono text-xs px-3 py-1.5 rounded shadow-lg backdrop-blur-sm flex items-center gap-2">
                <span>FILTERED: Conf &lt; Thresh ({confThreshold.toFixed(2)})</span>
              </div>
            )}

            {/* Viewport Bottom Right Processing HUD */}
            <div className="absolute bottom-2 right-3 bg-white/90 border border-[#E9D5FF] px-2.5 py-1 rounded text-[10px] font-mono text-slate-800 flex items-center gap-2 backdrop-blur-md pointer-events-none shadow-sm z-10">
              <span className="text-slate-500">TRACKER:</span>
              <span className="text-slate-900 font-semibold">ByteTrack-v2</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">IOU:</span>
              <span className="text-[#7E22CE] font-semibold">0.82</span>
            </div>
          </div>
        ) : (
          /* Static Media Upload View */
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#FAF8FF]">
            {staticMedia ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {staticMedia.type === 'video' ? (
                  <video src={staticMedia.url} controls autoPlay loop className="max-h-full max-w-full rounded" />
                ) : (
                  <img src={staticMedia.url} alt="Static Upload Preview" className="max-h-full max-w-full object-contain rounded" />
                )}
                <div className="absolute top-2 left-2 bg-white/90 border border-[#E9D5FF] px-2.5 py-1 rounded text-[10px] font-mono text-slate-800">
                  FILE: {staticMedia.name} · READY FOR INFERENCE
                </div>
                <button
                  onClick={() => setStaticMedia(null)}
                  className="absolute top-2 right-2 bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded text-[10px] font-mono hover:bg-rose-100"
                >
                  Clear File
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#DDD6FE] hover:border-[#A855F7] transition-colors rounded-lg w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer bg-white"
              >
                <UploadCloud className="w-10 h-10 text-[#A855F7] mb-3" />
                <h3 className="font-mono text-sm font-semibold text-slate-800">
                  Select or Drag Dataset Media File
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Supported formats: MP4, AVI, WebM (H.264 / NVENC compatible) or static JPG, PNG image tensors.
                </p>
                <button
                  type="button"
                  className="mt-4 px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] text-xs font-mono text-[#7E22CE] font-medium rounded-md border border-[#E9D5FF] shadow-sm transition-colors"
                >
                  Browse Local Storage
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewport Controls & Confidence Sliders */}
      <div 
        className="bg-white border border-[#E2E8F0] p-3 rounded-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        data-purpose="viewport-controls"
      >
        {/* Primary Stream Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Button 1: Start Video Stream */}
          <button
            onClick={() => {
              onToggleStreaming(true);
              onShowToast('Video Stream Pipeline Resumed [RTSP_OK]', 'success');
            }}
            disabled={isStreaming}
            className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm ${
              isStreaming
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-[#9333EA] hover:bg-[#7E22CE] text-white active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Video Stream</span>
          </button>

          {/* Button 2: Stop Stream */}
          <button
            onClick={() => {
              onToggleStreaming(false);
              onShowToast('Stream Pipeline Halted. Frame buffer frozen.', 'warning');
            }}
            disabled={!isStreaming}
            className={`px-3 py-1.5 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors shadow-sm ${
              !isStreaming
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-slate-300 text-slate-700 active:scale-95'
            }`}
          >
            <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Stop Stream</span>
          </button>

          {/* Button 3: Capture Snapshot */}
          <button
            onClick={onCaptureSnapshot}
            className="bg-white hover:bg-[#FAF5FF] border border-[#E2E8F0] hover:border-[#DDD6FE] text-slate-700 hover:text-[#7E22CE] px-3 py-1.5 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
            title="Freeze and log current tensor into volatile ledger"
          >
            <Camera className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Capture Snapshot</span>
          </button>

          {/* Button 4: Reset Session Buffer */}
          <button
            onClick={onResetBuffer}
            className="bg-white hover:bg-slate-50 border border-[#E2E8F0] text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
            title="Purge session memory ring buffer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Session Buffer</span>
          </button>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label htmlFor="conf-slider" className="text-xs font-mono text-slate-600 whitespace-nowrap font-medium">
            CONF_THRESH:
          </label>
          <input
            id="conf-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confThreshold}
            onChange={(e) => onChangeConfThreshold(parseFloat(e.target.value))}
            className="w-28 sm:w-36 h-1.5 bg-[#E9D5FF] rounded appearance-none cursor-pointer"
          />
          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#FAF5FF] border border-[#DDD6FE] text-[#7E22CE] rounded min-w-[44px] text-center shadow-sm">
            {confThreshold.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quick State Simulation Pills (Optional testing aid for researchers) */}
      <div className="bg-[#FAF5FF]/60 border border-[#E9D5FF] px-3 py-1.5 rounded-md flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#9333EA]" />
          <span>Expression Injector:</span>
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          {(['HAPPINESS', 'NEUTRALITY', 'SURPRISE', 'SADNESS', 'ANGER', 'FEAR'] as EmotionType[]).map((emo) => (
            <button
              key={emo}
              onClick={() => onSelectSimulatedEmotion(emo)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition-all ${
                currentEmotion === emo
                  ? 'bg-[#9333EA] text-white shadow-xs'
                  : 'bg-white hover:bg-purple-100 text-[#7E22CE] border border-[#E9D5FF]'
              }`}
            >
              {emo.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
