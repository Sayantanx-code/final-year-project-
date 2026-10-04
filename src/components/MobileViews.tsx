import React from 'react';
import { 
  Play, 
  Square, 
  Camera, 
  RotateCcw, 
  Activity, 
  TrendingUp, 
  Cpu, 
  ChevronRight,
  Smile,
  Meh,
  Sliders,
  Sparkles,
  Wifi,
  Shield,
  Layers,
  Settings2
} from 'lucide-react';
import { 
  EmotionType, 
  EmotionScore, 
  SnapshotRecord, 
  SystemTelemetry, 
  MobileTab 
} from '../types';

interface MobileMonitorProps {
  isStreaming: boolean;
  onToggleStreaming: (start: boolean) => void;
  onCaptureSnapshot: () => void;
  onResetBuffer: () => void;
  confThreshold: number;
  onChangeConfThreshold: (val: number) => void;
  currentConfidence: number;
  currentEmotion: EmotionType;
  emotionScores: EmotionScore[];
  telemetry: SystemTelemetry;
  historyWaveform: number[];
  records: SnapshotRecord[];
  onInspectRecord: (record: SnapshotRecord) => void;
  onSelectTab: (tab: MobileTab) => void;
  onSelectSimulatedEmotion: (emotion: EmotionType) => void;
}

export const MobileMonitorView: React.FC<MobileMonitorProps> = ({
  isStreaming,
  onToggleStreaming,
  onCaptureSnapshot,
  onResetBuffer,
  confThreshold,
  onChangeConfThreshold,
  currentConfidence,
  currentEmotion,
  emotionScores,
  telemetry,
  historyWaveform,
  records,
  onInspectRecord,
  onSelectTab,
  onSelectSimulatedEmotion,
}) => {
  const isBboxVisible = isStreaming && currentConfidence >= confThreshold;

  // Sparkline coordinates for mobile
  const sparkPoints = historyWaveform.slice(-15).map((val, idx, arr) => {
    const x = (idx / (arr.length - 1)) * 320;
    const y = 50 - (val * 40);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const sparkPolyline = sparkPoints.join(' ');
  const sparkPolygon = `0,60 0,${sparkPoints[0]?.split(',')[1] || '40'} ${sparkPolyline} 320,60`;

  return (
    <div className="flex flex-col w-full px-3 sm:px-4 py-2 space-y-3.5">
      {/* Compact Realtime Status Bar */}
      <section className="w-full bg-white p-2.5 rounded-xl shadow-xs border border-[#E9D5FF] flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9333EA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9333EA]"></span>
            </span>
            <span className="font-mono text-[10px] text-[#7E22CE] font-semibold truncate tracking-tight">
              WS CONNECTED (127.0.0.1:8000)
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              YOLO11-CLS
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#6B21A8] font-semibold">
              FP16
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#FAF8FF] px-2.5 py-1 rounded-lg text-slate-600 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="text-slate-400">LAT:</span>
              <span className="text-slate-900 font-semibold">{telemetry.latency.toFixed(1)} ms</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">RATE:</span>
              <span className="text-slate-900 font-semibold">{telemetry.fps.toFixed(1)} FPS</span>
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>
            <span>JITTER ±{telemetry.jitter}ms</span>
          </div>
        </div>
      </section>

      {/* Ingestion Source Mode Switcher */}
      <section className="w-full">
        <div className="grid grid-cols-2 p-1 bg-[#F3E8FF] rounded-xl shadow-inner gap-1 font-mono text-xs">
          <button
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white text-[#7E22CE] shadow-xs font-semibold"
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>
            <span>Live Stream (RTSP)</span>
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-slate-600 hover:text-slate-900"
            type="button"
          >
            <span>Static Upload</span>
          </button>
        </div>
      </section>

      {/* Video Viewport Container with Detection Overlays */}
      <section className="w-full relative bg-white rounded-xl shadow-sm border border-[#E9D5FF] overflow-hidden flex flex-col">
        {/* Stream Metadata Header Badge */}
        <div className="px-2.5 py-1.5 bg-[#FAF8FF] border-b border-[#E9D5FF] flex items-center justify-between text-slate-600 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'} shrink-0`}></span>
            <span className="font-semibold text-slate-800 truncate">CAM_01 [RTSP://192.168.1.104/LIVE]</span>
          </div>
          <span className="shrink-0 text-[#9333EA] font-semibold">RAW 1080P60</span>
        </div>

        {/* Feed Aspect Box */}
        <div className="relative w-full aspect-video bg-slate-900 overflow-hidden select-none">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1WkUMzazXyiCQ1rswIwmEjPegHNUwu8Yu6jBTSHhK9CkEdl4eZG8sk9rXHQqwi4pYH-zBRyApD4_GvMZKkTHmcmulIypeDKRCQIsDYDsODrXTOygyWbT9SLDzkkyRsKvUmX8cdU_L6jiyR39Hn1DvJuXy9MXkFjc_2icLPBW1p5wL9C4Yd0zSWb16xXaMNLFaa6NK_wPpQYEeSi3qnqDhrU2KxW97x17jZ80a416-yIQ2QwoMr1zKAhENw"
            alt="Facial Emotion Recognition subject live stream frame"
            className={`w-full h-full object-cover transition-opacity duration-200 ${!isStreaming ? 'opacity-40 grayscale' : ''}`}
          />

          {/* HUD Grid Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <defs>
              <pattern id="mobileGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ddb8ff" strokeWidth="0.5" strokeDasharray="2 2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mobileGrid)" />
          </svg>

          {/* Precision Purple Bounding Box Overlay */}
          {isStreaming && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div 
                className={`relative w-[52%] h-[68%] -translate-y-2 transition-opacity ${
                  isBboxVisible ? 'opacity-100' : 'opacity-20'
                }`}
              >
                {/* Bounding box outer frame */}
                <div className="absolute inset-0 bg-[#9333EA]/10 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.35)] border border-[#C084FC]"></div>

                {/* Corner brackets */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#DDD6FE]"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#DDD6FE]"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#DDD6FE]"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#DDD6FE]"></div>

                {/* Bounding Box Telemetry Flag Tag */}
                <div className="absolute -top-6 left-0 bg-[#9333EA] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md font-mono text-[9px] text-white">
                  <span className="font-semibold tracking-wider uppercase">{currentEmotion}: {(currentConfidence * 100).toFixed(1)}%</span>
                  <span className="text-[#E9D5FF]">ID:#0412</span>
                </div>

                {/* Facial Landmark Dots */}
                <div className="absolute top-[38%] left-[28%] w-1.5 h-1.5 rounded-full bg-[#E9D5FF] shadow-[0_0_8px_#c084fc] animate-ping"></div>
                <div className="absolute top-[38%] left-[28%] w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="absolute top-[38%] right-[28%] w-1.5 h-1.5 rounded-full bg-[#E9D5FF] shadow-[0_0_8px_#c084fc] animate-ping"></div>
                <div className="absolute top-[38%] right-[28%] w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="absolute top-[52%] left-[48%] w-1.5 h-1.5 rounded-full bg-[#C084FC]"></div>
                <div className="absolute top-[68%] left-[36%] w-1.5 h-1.5 rounded-full bg-[#DDD6FE]"></div>
                <div className="absolute top-[68%] right-[36%] w-1.5 h-1.5 rounded-full bg-[#DDD6FE]"></div>
                <div className="absolute top-[72%] left-[48%] w-1.5 h-1.5 rounded-full bg-white"></div>

                {/* Tracker Badge Bottom Edge */}
                <div className="absolute -bottom-5 right-0 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-xs font-mono text-[8px] text-[#7E22CE] font-semibold border border-[#E9D5FF]">
                  ByteTrack-v2 • IOU:0.82
                </div>
              </div>
            </div>
          )}

          {/* Watermark Frame Indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-white font-mono text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA] animate-pulse"></span>
            <span>FRAME #{telemetry.framesAnalyzed.toString().padStart(5, '0')} • CONF: {currentConfidence.toFixed(3)}</span>
          </div>
        </div>

        {/* Compact Slider & Threshold Controller Bar */}
        <div className="p-2.5 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 shrink-0 font-mono text-xs">
            <span className="text-slate-600 font-semibold text-[11px]">CONF_THRESH</span>
            <span className="text-[#7E22CE] bg-[#F3E8FF] px-1.5 py-0.5 rounded font-bold text-[11px]">
              {confThreshold.toFixed(2)}
            </span>
          </div>
          <div className="flex-1 flex items-center">
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={confThreshold}
              onChange={(e) => onChangeConfThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E9D5FF] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Quick Action Control Deck */}
      <section className="w-full grid grid-cols-4 gap-2">
        <button
          onClick={() => onToggleStreaming(true)}
          disabled={isStreaming}
          className={`col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl shadow-md font-mono text-xs font-semibold transition-all ${
            isStreaming 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-[#9333EA] hover:bg-[#7E22CE] text-white active:scale-95'
          }`}
          type="button"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Stream</span>
        </button>

        <button
          onClick={() => onToggleStreaming(false)}
          disabled={!isStreaming}
          className={`col-span-1 flex items-center justify-center gap-1 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs font-mono text-xs transition-all ${
            !isStreaming 
              ? 'opacity-50 cursor-not-allowed text-slate-400' 
              : 'text-slate-700 hover:bg-slate-50 active:scale-95'
          }`}
          type="button"
        >
          <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Halt</span>
        </button>

        <div className="flex gap-1.5 col-span-1">
          <button
            onClick={onCaptureSnapshot}
            className="flex-1 flex items-center justify-center bg-white border border-[#E2E8F0] hover:bg-[#FAF5FF] text-[#9333EA] rounded-xl shadow-xs transition-colors"
            title="Capture Snapshot"
            type="button"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={onResetBuffer}
            className="flex-1 flex items-center justify-center bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 rounded-xl shadow-xs transition-colors"
            title="Reset Buffer"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Dominant State & Classification Readout */}
      <section className="w-full bg-white p-3.5 rounded-xl shadow-sm border border-[#E9D5FF] space-y-2 font-mono">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#9333EA] uppercase font-bold tracking-wider">DOMINANT STATE [ARGMAX]</span>
          <span className="text-slate-500 font-medium">GPU_0 (RTX 4090 • 38% UTIL)</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#6B21A8] font-headline tracking-tight">
              {currentEmotion}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#6B21A8] border border-[#DDD6FE] text-[10px] font-semibold">
              TOP-1: {currentConfidence.toFixed(3)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500">TOP-2: NEUTRALITY (0.041)</span>
          </div>
        </div>

        {/* Soft Horizontal Separator Bar */}
        <div className="w-full h-px bg-[#E9D5FF] my-1"></div>

        {/* Probability Distribution (6 Emotional Vectors) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>LOGIT DISTRIBUTION CLASS</span>
            <span>SOFTMAX WEIGHT</span>
          </div>

          {emotionScores.map((score) => {
            const isTop = score.emotion === currentEmotion;
            return (
              <div key={score.emotion} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`${isTop ? 'font-semibold text-[#7E22CE]' : 'text-slate-700'}`}>
                    {score.name}
                  </span>
                  <span className={`${isTop ? 'font-bold text-[#9333EA]' : 'text-slate-600'} text-[11px]`}>
                    {score.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      isTop ? 'bg-[#9333EA]' : score.percentage > 3 ? 'bg-[#C084FC]' : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0.5, score.percentage))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mini Temporal Waveform & Confidence Sparkline */}
      <section className="w-full bg-white p-3.5 rounded-xl shadow-sm border border-[#E9D5FF] space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#9333EA]" />
            <span className="text-sm font-semibold text-slate-900 font-headline">Temporal Valence Sparkline</span>
          </div>
          <span className="text-[10px] text-slate-500">18,420 Frames</span>
        </div>

        {/* Inline SVG Sparkline Rolling Chart */}
        <div className="w-full h-20 bg-[#FAF8FF] border border-[#E9D5FF] rounded-lg p-2 relative overflow-hidden flex items-end">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 60">
            <defs>
              <linearGradient id="purpleGradMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#832ad3" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#832ad3" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Shaded fill under curve */}
            <polygon points={sparkPolygon} fill="url(#purpleGradMobile)" />
            {/* Active confidence line */}
            <polyline
              points={sparkPolyline}
              fill="none"
              stroke="#6200a9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Live pulse dot at sparkline tip */}
            <circle cx="320" cy={50 - (currentConfidence * 40)} r="3.5" fill="#6200a9" className="animate-pulse" />
          </svg>
          <div className="absolute top-2 right-2 text-[#7E22CE] font-mono text-[9px] bg-white/90 px-1 rounded shadow-xs border border-[#E9D5FF]">
            V_CONF: {(currentConfidence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-500 text-[9px] pt-0.5">
          <span>T - 15.0s</span>
          <span className="text-[#7E22CE] font-semibold">STABLE INFERENCE RUNTIME</span>
          <span>LIVE (T-0)</span>
        </div>
      </section>

      {/* Recent Telemetry Ledger Preview */}
      <section className="w-full bg-white p-3.5 rounded-xl shadow-sm border border-[#E9D5FF] space-y-2 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#9333EA]" />
            <span className="text-sm font-semibold text-slate-900 font-headline">Recent Telemetry Ledger</span>
          </div>
          <button
            onClick={() => onSelectTab('ledger')}
            className="text-[#7E22CE] text-[10px] font-semibold hover:underline"
            type="button"
          >
            VIEW ALL
          </button>
        </div>

        <div className="space-y-1.5">
          {records.slice(0, 3).map((rec) => (
            <div
              key={rec.id}
              onClick={() => onInspectRecord(rec)}
              className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8FF] hover:bg-[#F3E8FF] transition-colors border border-transparent hover:border-[#DDD6FE] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-white border border-[#E9D5FF] shrink-0 overflow-hidden flex items-center justify-center text-[#7E22CE]">
                  {rec.emotion === 'HAPPINESS' ? <Smile className="w-4 h-4" /> : <Meh className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">{rec.emotion} {rec.confidence.toFixed(3)}</span>
                    <span className="text-[10px] text-slate-500 truncate">#0412</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">
                    HASH: {rec.hash.substring(0, 8)}...
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 font-medium block">
                  {rec.timestamp.split(' ')[1] || '14:02:18.421'}
                </span>
                <button
                  className="text-[#7E22CE] text-[10px] font-semibold flex items-center justify-end gap-0.5"
                  type="button"
                >
                  <span>INSPECT</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
