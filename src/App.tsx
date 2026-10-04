/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  VideoViewport 
} from './components/VideoViewport';
import { 
  MetricsPanel 
} from './components/MetricsPanel';
import { 
  SnapshotLedger 
} from './components/SnapshotLedger';
import { 
  MobileMonitorView 
} from './components/MobileViews';
import { 
  Modals 
} from './components/Modals';
import { 
  ToastContainer, 
  ToastMessage 
} from './components/Toast';
import { 
  EmotionType, 
  EmotionScore, 
  SnapshotRecord, 
  SystemTelemetry, 
  MobileTab, 
  ViewportMode 
} from './types';
import { 
  Video, 
  Activity, 
  ReceiptText, 
  Sliders, 
  ShieldCheck, 
  FileText, 
  Network,
  Cpu,
  RefreshCw,
  Info,
  Layers,
  Sparkles,
  BarChart2,
  CheckCircle2
} from 'lucide-react';

const INITIAL_RECORDS: SnapshotRecord[] = [
  {
    id: 'rec-1',
    timestamp: '2026-03-30 14:02:18.421',
    emotion: 'HAPPINESS',
    confidence: 0.942,
    bbox: [542, 198, 284, 342],
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85c',
    tensorDetails: {
      shape: '[1, 3, 224, 224]',
      precision: 'FP16',
      device: 'GPU_0 (NVIDIA RTX 4090)',
      latencyMs: 14.2,
      rawLogits: {
        HAPPINESS: 4.82,
        NEUTRALITY: 1.15,
        SURPRISE: 0.12,
        SADNESS: -1.45,
        ANGER: -1.98,
        FEAR: -2.34,
      },
      normalization: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
      },
    },
  },
  {
    id: 'rec-2',
    timestamp: '2026-03-30 14:02:17.419',
    emotion: 'HAPPINESS',
    confidence: 0.928,
    bbox: [540, 199, 285, 340],
    hash: '4f89d311b5e28a9e7f415089c20147926189ef94129b001a48c9038234212a9e',
    tensorDetails: {
      shape: '[1, 3, 224, 224]',
      precision: 'FP16',
      device: 'GPU_0 (NVIDIA RTX 4090)',
      latencyMs: 14.1,
      rawLogits: {
        HAPPINESS: 4.65,
        NEUTRALITY: 1.22,
        SURPRISE: 0.18,
        SADNESS: -1.35,
        ANGER: -1.90,
        FEAR: -2.25,
      },
      normalization: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
      },
    },
  },
  {
    id: 'rec-3',
    timestamp: '2026-03-30 14:02:16.418',
    emotion: 'NEUTRALITY',
    confidence: 0.891,
    bbox: [539, 196, 283, 341],
    hash: 'a901ff3ba408e01149e89b2518e001925b0188ca298fba01192e0040182cc120',
    tensorDetails: {
      shape: '[1, 3, 224, 224]',
      precision: 'FP16',
      device: 'GPU_0 (NVIDIA RTX 4090)',
      latencyMs: 14.4,
      rawLogits: {
        HAPPINESS: 1.05,
        NEUTRALITY: 4.31,
        SURPRISE: 0.45,
        SADNESS: -0.80,
        ANGER: -1.20,
        FEAR: -1.85,
      },
      normalization: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
      },
    },
  },
  {
    id: 'rec-4',
    timestamp: '2026-03-30 14:02:15.417',
    emotion: 'SURPRISE',
    confidence: 0.915,
    bbox: [544, 195, 286, 344],
    hash: '719bca8892ca0155b9a803e19842f1b0a98018fb2098ca398fba019488b4001d',
    tensorDetails: {
      shape: '[1, 3, 224, 224]',
      precision: 'FP16',
      device: 'GPU_0 (NVIDIA RTX 4090)',
      latencyMs: 14.3,
      rawLogits: {
        HAPPINESS: 0.85,
        NEUTRALITY: 0.95,
        SURPRISE: 4.50,
        SADNESS: -1.50,
        ANGER: -2.10,
        FEAR: -1.10,
      },
      normalization: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
      },
    },
  },
];

export default function App() {
  // System State
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    wsConnected: true,
    wsUri: 'ws://127.0.0.1:8000/ws/inference/live',
    domain: 'console.project-fer.internal',
    engine: 'YOLO11-CLS (TensorRT / FP16)',
    latency: 14.2,
    fps: 30.0,
    jitter: 0.4,
    framesAnalyzed: 18420,
    droppedFrames: 0,
    gpuModel: 'GPU_0 (NVIDIA RTX 4090)',
    gpuUtil: 38,
  });

  const [isStreaming, setIsStreaming] = useState(true);
  const [confThreshold, setConfThreshold] = useState(0.50);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('HAPPINESS');
  const [baseConfidence, setBaseConfidence] = useState(0.942);
  const [records, setRecords] = useState<SnapshotRecord[]>(INITIAL_RECORDS);

  // Layout View Modes
  const [viewportMode, setViewportMode] = useState<ViewportMode>('responsive');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('monitor');

  // Modals & Toasts
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Waveform history buffer (last 40 points)
  const [historyWaveform, setHistoryWaveform] = useState<number[]>([
    0.60, 0.62, 0.61, 0.65, 0.64, 0.68, 0.70, 0.72, 0.71, 0.75,
    0.78, 0.76, 0.80, 0.82, 0.81, 0.85, 0.84, 0.86, 0.88, 0.87,
    0.89, 0.90, 0.88, 0.91, 0.92, 0.90, 0.92, 0.93, 0.91, 0.93,
    0.94, 0.93, 0.94, 0.95, 0.94, 0.93, 0.94, 0.95, 0.94, 0.942,
  ]);

  const [neutralityWaveform, setNeutralityWaveform] = useState<number[]>([
    0.15, 0.14, 0.16, 0.15, 0.18, 0.14, 0.12, 0.11, 0.13, 0.10,
    0.09, 0.08, 0.09, 0.07, 0.06, 0.08, 0.07, 0.06, 0.05, 0.06,
    0.05, 0.04, 0.05, 0.04, 0.05, 0.04, 0.05, 0.04, 0.04, 0.041,
    0.042, 0.040, 0.041, 0.043, 0.041, 0.040, 0.042, 0.041, 0.041, 0.041,
  ]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time inference ticker loop when isStreaming is active
  useEffect(() => {
    if (!isStreaming) {
      setTelemetry((prev) => ({ ...prev, fps: 0.0 }));
      return;
    }

    const interval = setInterval(() => {
      // Small natural micro-fluctuation of confidence around current baseline
      const confDelta = (Math.random() - 0.48) * 0.006;
      const newConf = Math.min(0.985, Math.max(0.65, baseConfidence + confDelta));

      // Telemetry telemetry updates
      setTelemetry((prev) => ({
        ...prev,
        framesAnalyzed: prev.framesAnalyzed + 1,
        latency: 14.0 + Math.random() * 0.4,
        fps: 29.9 + (Math.random() - 0.5) * 0.3,
        jitter: parseFloat((0.35 + Math.random() * 0.1).toFixed(2)),
      }));

      // Update waveform series
      setHistoryWaveform((prev) => [...prev.slice(1), newConf]);
      setNeutralityWaveform((prev) => [
        ...prev.slice(1),
        parseFloat((0.038 + Math.random() * 0.006).toFixed(3)),
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isStreaming, baseConfidence]);

  // Compute 6-class probability distribution based on current dominant emotion
  const emotionScores: EmotionScore[] = useMemo(() => {
    const dominantConf = historyWaveform[historyWaveform.length - 1] || baseConfidence;
    const remaining = Math.max(0.01, 1 - dominantConf);

    const baseMap: Record<EmotionType, number> = {
      HAPPINESS: 0,
      NEUTRALITY: 0,
      SURPRISE: 0,
      SADNESS: 0,
      ANGER: 0,
      FEAR: 0,
    };

    baseMap[currentEmotion] = dominantConf;

    // Distribute remaining among other classes
    const otherClasses = (Object.keys(baseMap) as EmotionType[]).filter((e) => e !== currentEmotion);
    const weights = [0.65, 0.20, 0.08, 0.04, 0.03]; // realistic power distribution
    otherClasses.forEach((cls, i) => {
      baseMap[cls] = remaining * (weights[i] || 0.02);
    });

    return [
      {
        emotion: 'HAPPINESS',
        name: 'Happiness',
        percentage: baseMap.HAPPINESS * 100,
        weight: baseMap.HAPPINESS,
        color: '#9333EA',
        bgColor: '#F3E8FF',
      },
      {
        emotion: 'NEUTRALITY',
        name: 'Neutrality',
        percentage: baseMap.NEUTRALITY * 100,
        weight: baseMap.NEUTRALITY,
        color: '#C084FC',
        bgColor: '#F5F3FF',
      },
      {
        emotion: 'SURPRISE',
        name: 'Surprise',
        percentage: baseMap.SURPRISE * 100,
        weight: baseMap.SURPRISE,
        color: '#A855F7',
        bgColor: '#FAF5FF',
      },
      {
        emotion: 'SADNESS',
        name: 'Sadness',
        percentage: baseMap.SADNESS * 100,
        weight: baseMap.SADNESS,
        color: '#94A3B8',
        bgColor: '#F1F5F9',
      },
      {
        emotion: 'ANGER',
        name: 'Anger',
        percentage: baseMap.ANGER * 100,
        weight: baseMap.ANGER,
        color: '#94A3B8',
        bgColor: '#F1F5F9',
      },
      {
        emotion: 'FEAR',
        name: 'Fear',
        percentage: baseMap.FEAR * 100,
        weight: baseMap.FEAR,
        color: '#94A3B8',
        bgColor: '#F1F5F9',
      },
    ];
  }, [currentEmotion, historyWaveform, baseConfidence]);

  const currentConfidence = historyWaveform[historyWaveform.length - 1] || baseConfidence;

  // Top 2 emotion lookup
  const top2Emotion = useMemo(() => {
    const sorted = [...emotionScores].sort((a, b) => b.weight - a.weight);
    const second = sorted[1] || sorted[0];
    return { name: second.name.toUpperCase(), conf: second.weight };
  }, [emotionScores]);

  // Expression simulator handler
  const handleSelectSimulatedEmotion = (emotion: EmotionType) => {
    setCurrentEmotion(emotion);
    setBaseConfidence(0.92 + Math.random() * 0.04);
    showToast(`Injecting expression vector: ${emotion}`, 'info');
  };

  // Capture Snapshot Handler
  const handleCaptureSnapshot = () => {
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').substring(0, 23);
    const randHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newRecord: SnapshotRecord = {
      id: `rec-${Date.now()}`,
      timestamp: ts,
      emotion: currentEmotion,
      confidence: currentConfidence,
      bbox: [
        540 + Math.floor(Math.random() * 6),
        196 + Math.floor(Math.random() * 5),
        284 + Math.floor(Math.random() * 4),
        342 + Math.floor(Math.random() * 4),
      ],
      hash: randHex,
      tensorDetails: {
        shape: '[1, 3, 224, 224]',
        precision: 'FP16',
        device: telemetry.gpuModel,
        latencyMs: telemetry.latency,
        rawLogits: {
          HAPPINESS: currentEmotion === 'HAPPINESS' ? 4.82 : 0.85,
          NEUTRALITY: currentEmotion === 'NEUTRALITY' ? 4.31 : 1.15,
          SURPRISE: currentEmotion === 'SURPRISE' ? 4.50 : 0.12,
          SADNESS: currentEmotion === 'SADNESS' ? 3.90 : -1.45,
          ANGER: currentEmotion === 'ANGER' ? 4.10 : -1.98,
          FEAR: currentEmotion === 'FEAR' ? 3.85 : -2.34,
        },
        normalization: {
          mean: [0.485, 0.456, 0.406],
          std: [0.229, 0.224, 0.225],
        },
      },
    };

    setRecords((prev) => [newRecord, ...prev.slice(0, 49)]);
    showToast(`Snapshot buffered into Volatile Ledger: ${ts}`, 'success');
  };

  // Reset Buffer Handler
  const handleResetBuffer = () => {
    setRecords([]);
    showToast('Session ring buffer purged. All volatile memory freed.', 'info');
  };

  // Inspect Record Modal Trigger
  const handleInspectRecord = (record: SnapshotRecord) => {
    setSelectedSnapshot(record);
    setActiveModal('inspect');
  };

  // Check if current display should render mobile view
  const isMobileLayout = viewportMode === 'mobile';

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAF8FF] selection:bg-[#F3E8FF] selection:text-[#6B21A8]">
      {/* Top Application Header */}
      <Header
        telemetry={telemetry}
        viewportMode={viewportMode}
        onChangeViewportMode={setViewportMode}
        onOpenModal={setActiveModal}
        isMobileLayoutActive={isMobileLayout}
      />

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto overflow-y-auto pb-16 lg:pb-6">
        {isMobileLayout ? (
          /* Mobile Frame Specimen View (Matching Screenshot 2 / HTML 2) */
          <div className="max-w-md mx-auto pt-2 pb-20">
            {activeMobileTab === 'monitor' && (
              <MobileMonitorView
                isStreaming={isStreaming}
                onToggleStreaming={setIsStreaming}
                onCaptureSnapshot={handleCaptureSnapshot}
                onResetBuffer={handleResetBuffer}
                confThreshold={confThreshold}
                onChangeConfThreshold={setConfThreshold}
                currentConfidence={currentConfidence}
                currentEmotion={currentEmotion}
                emotionScores={emotionScores}
                telemetry={telemetry}
                historyWaveform={historyWaveform}
                records={records}
                onInspectRecord={handleInspectRecord}
                onSelectTab={setActiveMobileTab}
                onSelectSimulatedEmotion={handleSelectSimulatedEmotion}
              />
            )}

            {activeMobileTab === 'metrics' && (
              <div className="p-4 space-y-4">
                <MetricsPanel
                  currentEmotion={currentEmotion}
                  confidence={currentConfidence}
                  emotionScores={emotionScores}
                  telemetry={telemetry}
                  historyWaveform={historyWaveform}
                  neutralityWaveform={neutralityWaveform}
                  top2Emotion={top2Emotion}
                />
              </div>
            )}

            {activeMobileTab === 'ledger' && (
              <div className="p-4">
                <SnapshotLedger
                  records={records}
                  onInspect={handleInspectRecord}
                  onClear={handleResetBuffer}
                  onShowToast={showToast}
                />
              </div>
            )}

            {activeMobileTab === 'settings' && (
              <div className="p-4 space-y-4 font-mono text-xs">
                <div className="bg-white p-4 rounded-xl shadow-xs border border-[#E9D5FF] space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E9D5FF] pb-2">
                    <Sliders className="w-4 h-4 text-[#9333EA]" />
                    <h2 className="text-sm font-semibold font-headline text-slate-900">Console Configuration</h2>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">RTSP Source Stream:</label>
                    <input
                      type="text"
                      readOnly
                      value="rtsp://192.168.1.104/live/stream1"
                      className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded px-3 py-1.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Model Engine:</label>
                    <input
                      type="text"
                      readOnly
                      value={telemetry.engine}
                      className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded px-3 py-1.5 text-slate-800"
                    />
                  </div>
                  <div className="pt-2 flex justify-between">
                    <button
                      onClick={() => setActiveModal('network')}
                      className="px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#7E22CE] font-semibold rounded text-xs"
                    >
                      Network &amp; Domain Setup
                    </button>
                    <button
                      onClick={() => setActiveModal('privacy')}
                      className="px-3 py-1.5 bg-white border border-[#E2E8F0] text-slate-700 rounded text-xs"
                    >
                      Privacy Spec
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Widescreen Layout (Matching Screenshot 1 / HTML 1) */
          <div className="px-4 py-4 space-y-4">
            {/* Top Two-Column Grid: Ingestion Feed vs Real-time Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Video Ingestion & Detection Viewport (Approx 60% / 7 cols) */}
              <div className="lg:col-span-7">
                <VideoViewport
                  isStreaming={isStreaming}
                  onToggleStreaming={setIsStreaming}
                  onCaptureSnapshot={handleCaptureSnapshot}
                  onResetBuffer={handleResetBuffer}
                  confThreshold={confThreshold}
                  onChangeConfThreshold={setConfThreshold}
                  currentConfidence={currentConfidence}
                  currentEmotion={currentEmotion}
                  onShowToast={showToast}
                  onSelectSimulatedEmotion={handleSelectSimulatedEmotion}
                />
              </div>

              {/* Right Column: Real-Time Inference Metrics (Approx 40% / 5 cols) */}
              <div className="lg:col-span-5">
                <MetricsPanel
                  currentEmotion={currentEmotion}
                  confidence={currentConfidence}
                  emotionScores={emotionScores}
                  telemetry={telemetry}
                  historyWaveform={historyWaveform}
                  neutralityWaveform={neutralityWaveform}
                  top2Emotion={top2Emotion}
                />
              </div>
            </div>

            {/* Bottom Row: Historical Inference Snapshot Ledger & Memory Buffer */}
            <SnapshotLedger
              records={records}
              onInspect={handleInspectRecord}
              onClear={handleResetBuffer}
              onShowToast={showToast}
            />
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation (Only visible on mobile screens or mobile mode) */}
      <nav 
        className={`fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-[#E9D5FF] shadow-[0_-2px_12px_rgba(126,34,206,0.08)] ${
          viewportMode === 'desktop' ? 'hidden' : 'block lg:hidden'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-around font-mono text-xs">
          <button
            onClick={() => setActiveMobileTab('monitor')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-colors ${
              activeMobileTab === 'monitor' ? 'text-[#7E22CE] font-bold' : 'text-slate-500 hover:text-[#7E22CE]'
            }`}
          >
            <Video className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Monitor</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('metrics')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-colors ${
              activeMobileTab === 'metrics' ? 'text-[#7E22CE] font-bold' : 'text-slate-500 hover:text-[#7E22CE]'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Metrics</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('ledger')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-colors ${
              activeMobileTab === 'ledger' ? 'text-[#7E22CE] font-bold' : 'text-slate-500 hover:text-[#7E22CE]'
            }`}
          >
            <ReceiptText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Ledger</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('settings')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-colors ${
              activeMobileTab === 'settings' ? 'text-[#7E22CE] font-bold' : 'text-slate-500 hover:text-[#7E22CE]'
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer Section (Matching Desktop Screenshot 1 / HTML 1) */}
      <footer 
        className="bg-white border-t border-[#E2E8F0] px-4 py-3 flex-none shadow-sm z-20"
        data-purpose="console-footer"
      >
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div>
            <span>(C) 2026 Academic Engineering Capstone Project. All rights reserved.</span>
          </div>

          {/* Compliance and Settings Modals Links */}
          <nav aria-label="Legal and Network" className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#7E22CE] transition-colors underline decoration-slate-300 underline-offset-4"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#7E22CE] transition-colors underline decoration-slate-300 underline-offset-4"
            >
              Terms and Conditions
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setActiveModal('network')}
              className="hover:text-[#7E22CE] transition-colors flex items-center gap-1"
            >
              <Network className="w-3 h-3 text-[#9333EA]" />
              <span>Network Settings</span>
            </button>
          </nav>
        </div>
      </footer>

      {/* Interactive Modals */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedSnapshot={selectedSnapshot}
        telemetry={telemetry}
        onUpdateTelemetry={(updates) => setTelemetry((prev) => ({ ...prev, ...updates }))}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
