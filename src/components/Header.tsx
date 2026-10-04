import React from 'react';
import { 
  Lock, 
  Activity, 
  Settings, 
  Monitor, 
  Smartphone, 
  Layers,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { SystemTelemetry, ViewportMode } from '../types';

interface HeaderProps {
  telemetry: SystemTelemetry;
  viewportMode: ViewportMode;
  onChangeViewportMode: (mode: ViewportMode) => void;
  onOpenModal: (modal: string) => void;
  isMobileLayoutActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  viewportMode,
  onChangeViewportMode,
  onOpenModal,
  isMobileLayoutActive,
}) => {
  return (
    <header className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex-none shadow-sm z-30 transition-all">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo & Product Title */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#FAF5FF] border border-[#E9D5FF] rounded text-[#9333EA] shadow-sm flex items-center justify-center">
            {/* Face bounding box reticle SVG */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <circle cx="12" cy="11" r="3" strokeWidth="1.5" />
              <path d="M9 16c1 .6 2 1 3 1s2-.4 3-1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-slate-900 uppercase font-headline">
                FER-DL Ingestion Console
              </h1>
              <span className="text-slate-400 font-mono text-xs font-normal">v1.0.4</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              FACIAL EMOTION RECOGNITION SYSTEM · INFERENCE CONSOLE
            </p>
          </div>
        </div>

        {/* Center: Domain Node Verification & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Domain verification badge */}
          <button
            onClick={() => onOpenModal('network')}
            className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] rounded-full font-mono text-xs text-purple-900 shadow-sm transition-colors cursor-pointer"
            title="Click to configure Network & Domain"
          >
            <Lock className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Domain: <span className="text-[#7E22CE] font-medium">{telemetry.domain}</span></span>
          </button>

          {/* Viewport Layout Mode Selector */}
          <div className="hidden xl:flex items-center bg-[#FAF8FF] border border-[#E2E8F0] p-0.5 rounded-md text-[11px] font-mono">
            <button
              onClick={() => onChangeViewportMode('responsive')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                viewportMode === 'responsive' 
                  ? 'bg-white text-[#7E22CE] font-semibold shadow-xs border border-[#E9D5FF]' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Responsive layout based on screen width"
            >
              <Layers className="w-3 h-3 text-[#9333EA]" />
              <span>Auto</span>
            </button>
            <button
              onClick={() => onChangeViewportMode('desktop')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                viewportMode === 'desktop' 
                  ? 'bg-white text-[#7E22CE] font-semibold shadow-xs border border-[#E9D5FF]' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Force Desktop Widescreen Layout"
            >
              <Monitor className="w-3 h-3 text-[#9333EA]" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => onChangeViewportMode('mobile')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                viewportMode === 'mobile' 
                  ? 'bg-white text-[#7E22CE] font-semibold shadow-xs border border-[#E9D5FF]' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Preview Mobile Specimen Layout"
            >
              <Smartphone className="w-3 h-3 text-[#9333EA]" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* Right: Real-time System Telemetry Badges */}
        <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono">
          {/* WS Status */}
          <button
            onClick={() => onOpenModal('network')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] rounded-md shadow-sm transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[#7E22CE] font-semibold">WS CONNECTED</span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">(127.0.0.1:8000)</span>
          </button>

          {/* Model Engine */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-md text-slate-700 shadow-sm">
            <span className="text-slate-400">ENGINE:</span>
            <span className="font-medium text-slate-800">{telemetry.engine}</span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-slate-700 shadow-sm">
            <span className="text-slate-400">LAT:</span>
            <span className="text-[#9333EA] font-semibold tabular-nums">{telemetry.latency.toFixed(1)} ms</span>
          </div>

          {/* FPS */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-slate-700 shadow-sm">
            <span className="text-slate-400">RATE:</span>
            <span className="text-slate-800 font-semibold tabular-nums">{telemetry.fps.toFixed(1)} FPS</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => onOpenModal('network')}
            className="p-1 text-slate-500 hover:text-[#7E22CE] hover:bg-[#FAF5FF] rounded transition-colors"
            title="Settings & Parameters"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
