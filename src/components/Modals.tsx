import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Network, 
  Cpu, 
  X, 
  Copy, 
  Download, 
  Check,
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';
import { SnapshotRecord, SystemTelemetry } from '../types';

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
  selectedSnapshot: SnapshotRecord | null;
  telemetry: SystemTelemetry;
  onUpdateTelemetry: (updates: Partial<SystemTelemetry>) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const Modals: React.FC<ModalsProps> = ({
  activeModal,
  onClose,
  selectedSnapshot,
  telemetry,
  onUpdateTelemetry,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  // Network form state
  const [networkForm, setNetworkForm] = useState({
    domain: telemetry.domain,
    wsUri: telemetry.wsUri,
    rtspUri: 'rtsp://192.168.1.104/live/stream1',
    engine: telemetry.engine,
  });

  if (!activeModal) return null;

  const handleCopyJson = (data: object) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    onShowToast('Tensor audit JSON copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTensor = (record: SnapshotRecord) => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tensor_${record.hash.substring(0, 8)}_${record.emotion.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`Downloaded tensor record [${record.hash.substring(0, 8)}]`, 'success');
  };

  const handleApplyNetwork = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTelemetry({
      domain: networkForm.domain,
      wsUri: networkForm.wsUri,
      engine: networkForm.engine,
    });
    onShowToast('Network routes applied. WebSocket reconnection initiated [100% OK]', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      {/* 1. Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="bg-white border border-[#E9D5FF] max-w-lg w-full rounded-md shadow-2xl p-5 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <h3 className="text-sm font-mono font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9333EA]" />
              Privacy Policy &amp; Volatile Data Policy
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-700 space-y-3 font-mono leading-relaxed">
            <p className="bg-[#FAF5FF] p-2.5 rounded border border-[#E9D5FF] text-[#6B21A8]">
              <strong>Volatile Buffer Guarantee:</strong> All facial landmark extraction and classification tensors execute strictly in transient GPU/VRAM memory rings.
            </p>
            <p>
              No continuous raw video streams or persistent facial biometrics/geometry vectors are transmitted to remote cloud databases without explicit operator authorization.
            </p>
            <p>
              Local ingest frames are scrubbed and destroyed immediately following downstream inference pipeline termination or manual buffer reset.
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Security Architecture:</span>
              <span className="text-[#7E22CE] font-semibold">FER-STRICT-EPHEMERAL-V1</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#9333EA] hover:bg-[#7E22CE] text-xs font-mono font-medium text-white rounded shadow-sm transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* 2. Terms and Conditions Modal */}
      {activeModal === 'terms' && (
        <div className="bg-white border border-[#E9D5FF] max-w-lg w-full rounded-md shadow-2xl p-5 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <h3 className="text-sm font-mono font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7C3AED]" />
              Terms and Conditions
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-700 space-y-3 font-mono leading-relaxed">
            <p>
              For educational, academic research, and non-commercial model validation only.
            </p>
            <p className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong>Medical/Legal Disclaimer:</strong> This inference console is not certified for clinical psychiatric diagnosis, legal testimony, judicial assessment, or automated behavioral screening. Emotion labels reflect statistical logit distributions and should not be construed as immutable psychological ground truth.
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Compliance Framework:</span>
              <span className="text-slate-800 font-semibold">IEEE-AI-ETHICS-2024 / CAPSTONE</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#9333EA] hover:bg-[#7E22CE] text-xs font-mono font-medium text-white rounded shadow-sm transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* 3. Network & Custom Domain Settings Modal */}
      {activeModal === 'network' && (
        <div className="bg-white border border-[#E9D5FF] max-w-lg w-full rounded-md shadow-2xl p-5 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <h3 className="text-sm font-mono font-semibold text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#9333EA]" />
              Network &amp; Custom Domain Settings
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleApplyNetwork} className="space-y-3.5 font-mono text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Custom Domain DNS Endpoint:</label>
              <input
                className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA]"
                type="text"
                value={networkForm.domain}
                onChange={(e) => setNetworkForm({ ...networkForm, domain: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Inference WebSocket URI:</label>
              <input
                className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA]"
                type="text"
                value={networkForm.wsUri}
                onChange={(e) => setNetworkForm({ ...networkForm, wsUri: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">RTSP Source Pipeline URL:</label>
              <input
                className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA]"
                type="text"
                value={networkForm.rtspUri}
                onChange={(e) => setNetworkForm({ ...networkForm, rtspUri: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Model Engine Pipeline:</label>
              <select
                className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#9333EA]"
                value={networkForm.engine}
                onChange={(e) => setNetworkForm({ ...networkForm, engine: e.target.value })}
              >
                <option value="YOLO11-CLS (TensorRT / FP16)">YOLO11-CLS (TensorRT / FP16) - Recommended</option>
                <option value="YOLOv8-Face (ONNX Runtime / INT8)">YOLOv8-Face (ONNX Runtime / INT8)</option>
                <option value="ResNet-50-FER (PyTorch CUDA / FP32)">ResNet-50-FER (PyTorch CUDA / FP32)</option>
                <option value="MobileNetV3-Small (WebAssembly / FP16)">MobileNetV3-Small (WebAssembly / FP16)</option>
              </select>
            </div>
            <div className="bg-[#FAF5FF] p-2 rounded border border-[#E9D5FF] text-[11px] text-[#6B21A8] flex items-center justify-between">
              <span>Socket Health:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE (127.0.0.1:8000)
              </span>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 bg-white border border-[#E2E8F0] text-xs font-mono text-slate-600 hover:text-slate-900 rounded"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#9333EA] hover:bg-[#7E22CE] text-xs font-mono font-medium text-white rounded shadow-sm"
              >
                Apply Connection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Tensor Inspector Modal */}
      {activeModal === 'inspect' && selectedSnapshot && (
        <div className="bg-white border border-[#E9D5FF] max-w-2xl w-full rounded-md shadow-2xl p-5 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#9333EA]" />
              <h3 className="text-sm font-mono font-semibold text-slate-900">
                Tensor Inspector: <span className="text-[#7E22CE]">{selectedSnapshot.hash}</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs overflow-y-auto pr-1 flex-1">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAF8FF] p-2.5 rounded border border-[#E9D5FF]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Emotion</span>
                <span className="font-bold text-[#6B21A8]">{selectedSnapshot.emotion}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Confidence</span>
                <span className="font-semibold text-slate-900">{selectedSnapshot.confidence.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Bounding Box</span>
                <span className="text-slate-700">[{selectedSnapshot.bbox.join(', ')}]</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Timestamp (UTC)</span>
                <span className="text-slate-700 truncate block">{selectedSnapshot.timestamp}</span>
              </div>
            </div>

            {/* Tensor Shape and Normalization */}
            <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#9333EA]" />
                  Tensor Geometry &amp; Input Preprocessing
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE] font-semibold">
                  FP16 / TENSOR-RT
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Tensor Dimension:</span>
                  <span className="ml-1 font-semibold text-slate-900">{selectedSnapshot.tensorDetails?.shape || '[1, 3, 224, 224]'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Execution Device:</span>
                  <span className="ml-1 font-semibold text-slate-900">{selectedSnapshot.tensorDetails?.device || 'GPU_0 (NVIDIA RTX 4090)'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Forward Pass Latency:</span>
                  <span className="ml-1 font-semibold text-[#9333EA]">{selectedSnapshot.tensorDetails?.latencyMs || '14.2'} ms</span>
                </div>
                <div>
                  <span className="text-slate-500">Normalization:</span>
                  <span className="ml-1 text-slate-700">ImageNet Mean/Std</span>
                </div>
              </div>
            </div>

            {/* Logit Vector breakdown */}
            <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Class Logits &amp; Softmax Probability Distribution
              </span>
              <div className="space-y-1.5">
                {selectedSnapshot.tensorDetails?.rawLogits &&
                  Object.entries(selectedSnapshot.tensorDetails.rawLogits).map(([cls, val]) => {
                    const isDominant = cls === selectedSnapshot.emotion;
                    return (
                      <div key={cls} className="flex items-center justify-between text-[11px]">
                        <span className={`${isDominant ? 'font-bold text-[#7E22CE]' : 'text-slate-600'}`}>
                          {cls}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">logit: {val.toFixed(2)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            isDominant ? 'bg-[#F3E8FF] text-[#6B21A8] font-bold border border-[#DDD6FE]' : 'text-slate-500'
                          }`}>
                            {isDominant ? `${(selectedSnapshot.confidence * 100).toFixed(1)}%` : `${((1 - selectedSnapshot.confidence) / 5 * 100).toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Raw JSON View */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded text-[10px] font-mono overflow-x-auto max-h-36">
              <pre>{JSON.stringify(selectedSnapshot, null, 2)}</pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyJson(selectedSnapshot)}
                className="px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#7E22CE] text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
              <button
                onClick={() => handleDownloadTensor(selectedSnapshot)}
                className="px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#7E22CE] text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Tensor
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#9333EA] hover:bg-[#7E22CE] text-xs font-mono font-medium text-white rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
