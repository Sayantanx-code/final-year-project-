import React, { useState } from 'react';
import { 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Cpu, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { EmotionType, EmotionScore, SystemTelemetry } from '../types';

interface MetricsPanelProps {
  currentEmotion: EmotionType;
  confidence: number;
  emotionScores: EmotionScore[];
  telemetry: SystemTelemetry;
  historyWaveform: number[];
  neutralityWaveform: number[];
  top2Emotion: { name: string; conf: number };
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  currentEmotion,
  confidence,
  emotionScores,
  telemetry,
  historyWaveform,
  neutralityWaveform,
  top2Emotion,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number } | null>(null);

  // Generate SVG path for primary series
  const generatePath = (data: number[], height: number, width: number) => {
    if (data.length === 0) return '';
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      // Invert Y because SVG origin is top-left
      // val is between 0.0 and 1.0; 1.0 should map to y near 10, 0.0 near 90
      const y = height - (val * (height - 20) + 10);
      return { x, y };
    });

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x},${prev.y} ${midX},${(prev.y + curr.y) / 2} T ${curr.x},${curr.y}`;
    }
    return path;
  };

  const primaryPath = generatePath(historyWaveform, 100, 400);
  const secondaryPath = generatePath(neutralityWaveform, 100, 400);
  const currentY = 100 - (confidence * 80 + 10);

  return (
    <section className="flex flex-col gap-3" data-purpose="metrics-section">
      {/* Card 1: Dominant Emotion State */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-md shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-3">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-[#9333EA]" />
            Dominant State [Argmax]
          </span>
          <span className="text-[10px] font-mono text-slate-400 tabular-nums">
            FRAME #{telemetry.framesAnalyzed.toString().padStart(6, '0')}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-2xl font-mono font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span id="dominant-emotion-text" className="font-headline tracking-tight text-[#6B21A8]">
              {currentEmotion}
            </span>
            <span className="text-xs font-mono font-semibold text-[#6B21A8] bg-[#F3E8FF] px-2 py-0.5 border border-[#DDD6FE] rounded shadow-sm">
              TOP-1: <span id="dominant-conf-score">{confidence.toFixed(3)}</span>
            </span>
          </h2>
          <div className="text-right font-mono text-xs text-slate-500">
            TOP-2: <span className="text-slate-800 font-medium">{top2Emotion.name} ({top2Emotion.conf.toFixed(3)})</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
            TENSOR EXECUTOR:
          </span>
          <span className="text-slate-700 font-medium">
            {telemetry.gpuModel} - {telemetry.gpuUtil}% UTIL
          </span>
        </div>
      </div>

      {/* Card 2: Probability Distribution (Softmax Breakdown) */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-md shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-3">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
            <BarChart3 className="w-3.5 h-3.5 text-[#9333EA]" />
            Probability Distribution (6 Classes)
          </span>
          <span className="text-[10px] font-mono text-slate-400">SUM = 1.000</span>
        </div>

        {/* Six Class Bars in Baby Purple / Lilac */}
        <div className="space-y-2.5 font-mono text-xs">
          {emotionScores.map((item) => {
            const isTop = item.emotion === currentEmotion;
            return (
              <div key={item.emotion} className="transition-all duration-150">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className={`${isTop ? 'text-[#7E22CE] font-semibold' : 'text-slate-700'}`}>
                    {item.name}
                  </span>
                  <span className={`${isTop ? 'text-[#9333EA] font-bold' : 'text-slate-600 font-medium'} tabular-nums`}>
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div 
                  className={`w-full h-2 rounded overflow-hidden border ${
                    isTop ? 'bg-[#F3E8FF] border-[#E9D5FF]' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <div
                    className={`h-full rounded transition-all duration-200 ${
                      isTop 
                        ? 'bg-[#9333EA]' 
                        : item.percentage > 3 
                        ? 'bg-[#C084FC]' 
                        : item.percentage > 1 
                        ? 'bg-purple-300' 
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0.5, item.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Session Aggregate & 60-Second Timeline */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-md flex-1 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-[#9333EA]" />
              Temporal Confidence Waveform
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#7E22CE] font-semibold">
                <span className="w-2 h-0.5 bg-[#9333EA] inline-block rounded"></span>
                {currentEmotion}
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <span className="w-2 h-0.5 bg-slate-400 inline-block rounded"></span>
                Neutrality
              </span>
            </div>
          </div>

          {/* Vector Line Graph for Rolling 60s Window */}
          <div className="relative w-full h-24 bg-[#FAF8FF] border border-[#E9D5FF] my-2 rounded overflow-hidden shadow-inner">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 100"
            >
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333EA" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FAF8FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontals */}
              <line stroke="#E9D5FF" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="400" y1="25" y2="25" />
              <line stroke="#E9D5FF" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="400" y1="50" y2="50" />
              <line stroke="#E9D5FF" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="400" y1="75" y2="75" />

              {/* Vertical timestamps */}
              <line stroke="#E9D5FF" strokeWidth="1" x1="100" x2="100" y1="0" y2="100" />
              <line stroke="#E9D5FF" strokeWidth="1" x1="200" x2="200" y1="0" y2="100" />
              <line stroke="#E9D5FF" strokeWidth="1" x1="300" x2="300" y1="0" y2="100" />

              {/* Secondary series (Neutrality baseline) */}
              <path
                d={secondaryPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Primary series (Dominant Emotion in vivid baby purple) */}
              <path
                d={primaryPath}
                fill="none"
                stroke="#9333EA"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Highlight cursor point at current frame (t=0s) */}
              <circle
                cx="400"
                cy={currentY}
                fill="#9333EA"
                r="3.5"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </svg>

            {/* Axis labels */}
            <div className="absolute bottom-0.5 inset-x-0 flex justify-between px-2 text-[9px] font-mono text-slate-500 pointer-events-none">
              <span>-60s</span>
              <span>-45s</span>
              <span>-30s</span>
              <span>-15s</span>
              <span>0s (Now)</span>
            </div>
          </div>
        </div>

        {/* Session Summary Raw Stats Readout */}
        <div className="pt-2 border-t border-[#E2E8F0] text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>Frames Analyzed: <strong className="text-slate-800 tabular-nums">{telemetry.framesAnalyzed.toLocaleString()}</strong></span>
          <span>Dropped Frames: <strong className="text-slate-800">{telemetry.droppedFrames} (0.00%)</strong></span>
          <span>Jitter: <strong className="text-[#7E22CE]">+/- {telemetry.jitter}ms</strong></span>
        </div>
      </div>
    </section>
  );
};
