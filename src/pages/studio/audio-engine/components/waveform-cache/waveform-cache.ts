import { audioBufferCache, AudioBufferCache } from "../audio-buffer-cache";
import { WaveformData, WaveformDataBySamples } from "./types";

export class WaveformCache {
  private cache: Map<string, WaveformDataBySamples>;

  constructor(private bufferCache: AudioBufferCache) {
    this.cache = new Map();
  }

  add(id: string, waveformData: WaveformData, samplesPerPixel: number) {
    const entry = this.cache.get(id);
    if (entry) {
      this.cache.set(id, { ...entry, [samplesPerPixel]: waveformData });
    } else {
      this.cache.set(id, { [samplesPerPixel]: waveformData });
    }
  }

  copy(oldId: string, newId: string) {
    const buffer = this.cache.get(oldId);
    if (buffer) {
      this.cache.set(newId, buffer);
    }
  }

  get(id: string, samplesPerPixel: number) {
    const entry = this.cache.get(id);
    if (entry) {
      return entry[samplesPerPixel] || null;
    }
    return null;
  }

  has(id: string, samplesPerPixel: number) {
    if (this.cache.has(id)) {
      const entry = this.cache.get(id);
      return entry ? Boolean(entry[samplesPerPixel]) : false;
    }
    return this.cache.has(id);
  }

  remove(id: string) {
    this.cache.delete(id);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  removeOldestIfUnused() {
    const oldestKey = this.cache.keys().next().value;
    if (!this.bufferCache.has(oldestKey)) {
      this.cache.delete(oldestKey);
    }
  }
}

export const waveformCache = new WaveformCache(audioBufferCache);
