export interface Peak {
  min: number;
  max: number;
}

export type WaveformData = Peak[];

export type WaveformDataBySamples = Record<number, Peak[]>;
