export type EmotionType = 
  | 'HAPPINESS' 
  | 'NEUTRALITY' 
  | 'SURPRISE' 
  | 'SADNESS' 
  | 'ANGER' 
  | 'FEAR';

export interface EmotionScore {
  emotion: EmotionType;
  name: string;
  percentage: number;
  weight: number;
  color: string;
  bgColor: string;
}

export interface BoundingBoxCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SnapshotRecord {
  id: string;
  timestamp: string;
  emotion: EmotionType;
  confidence: number;
  bbox: [number, number, number, number];
  hash: string;
  previewUrl?: string;
  tensorDetails?: {
    shape: string;
    precision: string;
    device: string;
    latencyMs: number;
    rawLogits: Record<EmotionType, number>;
    normalization: {
      mean: number[];
      std: number[];
    };
  };
}

export interface SystemTelemetry {
  wsConnected: boolean;
  wsUri: string;
  domain: string;
  engine: string;
  latency: number;
  fps: number;
  jitter: number;
  framesAnalyzed: number;
  droppedFrames: number;
  gpuModel: string;
  gpuUtil: number;
}

export type StreamSourceMode = 'live' | 'static' | 'webcam';
export type MobileTab = 'monitor' | 'metrics' | 'ledger' | 'settings';
export type ViewportMode = 'responsive' | 'desktop' | 'mobile';
