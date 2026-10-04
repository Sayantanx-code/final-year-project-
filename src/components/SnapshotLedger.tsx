import React, { useState } from 'react';
import { 
  Terminal, 
  Download, 
  FileCode, 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { SnapshotRecord, EmotionType } from '../types';

interface SnapshotLedgerProps {
  records: SnapshotRecord[];
  onInspect: (record: SnapshotRecord) => void;
  onClear: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SnapshotLedger: React.FC<SnapshotLedgerProps> = ({
  records,
  onInspect,
  onClear,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [emotionFilter, setEmotionFilter] = useState<string>('ALL');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch = 
      rec.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.timestamp.includes(searchTerm) ||
      rec.emotion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = emotionFilter === 'ALL' || rec.emotion === emotionFilter;
    return matchesSearch && matchesEmotion;
  });

  const exportCSV = () => {
    if (records.length === 0) {
      onShowToast('Ledger buffer is empty. Capture snapshots first.', 'warning');
      return;
    }
    const headers = ['Timestamp_UTC', 'Detected_Emotion', 'Confidence', 'BBox_X', 'BBox_Y', 'BBox_W', 'BBox_H', 'SHA256_Hash'];
    const rows = records.map((r) => [
      r.timestamp,
      r.emotion,
      r.confidence.toFixed(3),
      r.bbox[0],
      r.bbox[1],
      r.bbox[2],
      r.bbox[3],
      r.hash,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session_ledger_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Generated session_ledger_export.csv dataset file', 'success');
  };

  const exportJSON = () => {
    if (records.length === 0) {
      onShowToast('Ledger buffer is empty. Capture snapshots first.', 'warning');
      return;
    }
    const auditData = {
      specVersion: '1.0.4',
      runtime: 'FER-DL Ingestion Console',
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records,
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytical_audit_v1_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Compiled analytical_audit_v1.json payload', 'success');
  };

  const getEmotionBadge = (emotion: EmotionType) => {
    switch (emotion) {
      case 'HAPPINESS':
        return 'bg-[#F3E8FF] text-[#6B21A8] border-[#DDD6FE]';
      case 'NEUTRALITY':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SURPRISE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SADNESS':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'ANGER':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'FEAR':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <section 
      className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-sm"
      data-purpose="ledger-section"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#9333EA]" />
            Inference Snapshot Ledger &amp; Memory Buffer
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Volatile ring buffer retaining the last 50 keyframe inference tensors ({records.length} buffered).
          </p>
        </div>

        {/* Ledger Action Export Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#7E22CE] font-medium text-xs font-mono rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
            title="Download CSV table log"
          >
            <Download className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Export Dataset Log (CSV)</span>
          </button>

          <button
            onClick={exportJSON}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#7E22CE] font-medium text-xs font-mono rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
            title="Download JSON structured audit"
          >
            <FileCode className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Export Analytical Audit (JSON)</span>
          </button>
        </div>
      </div>

      {/* Optional Search & Filters */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-1 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hash or emotion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8FF] border border-[#DDD6FE] rounded pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#9333EA]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
            className="bg-[#FAF8FF] border border-[#DDD6FE] text-slate-700 text-xs rounded px-2 py-1 focus:outline-none focus:border-[#9333EA]"
          >
            <option value="ALL">All Emotions</option>
            <option value="HAPPINESS">Happiness</option>
            <option value="NEUTRALITY">Neutrality</option>
            <option value="SURPRISE">Surprise</option>
            <option value="SADNESS">Sadness</option>
            <option value="ANGER">Anger</option>
            <option value="FEAR">Fear</option>
          </select>

          {records.length > 0 && (
            <button
              onClick={onClear}
              className="px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded transition-colors text-[11px] flex items-center gap-1"
              title="Clear ledger entries"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Purge</span>
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase border-b border-[#E2E8F0] bg-[#FAF8FF]">
              <th className="py-2.5 px-3 font-semibold">Timestamp (UTC)</th>
              <th className="py-2.5 px-3 font-semibold">Detected Emotion</th>
              <th className="py-2.5 px-3 font-semibold">Confidence</th>
              <th className="py-2.5 px-3 font-semibold">Bounding Box [X, Y, W, H]</th>
              <th className="py-2.5 px-3 font-semibold">SHA-256 Hash</th>
              <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-slate-700" id="ledger-body">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                  No tensor snapshots currently buffered in volatile ledger.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-[#FAF5FF] transition-colors group">
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] tabular-nums whitespace-nowrap">
                    {record.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getEmotionBadge(record.emotion)}`}
                    >
                      {record.emotion}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-semibold tabular-nums">
                    {record.confidence.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    [{record.bbox.join(', ')}]
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                    {record.hash.substring(0, 8)}...{record.hash.substring(record.hash.length - 5)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onInspect(record)}
                      className="text-[#9333EA] hover:text-[#7E22CE] text-[11px] font-mono font-medium inline-flex items-center gap-1 group-hover:underline"
                    >
                      <span>[Inspect Tensor]</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
