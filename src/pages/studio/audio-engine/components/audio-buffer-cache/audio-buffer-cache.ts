import * as Tone from "tone";
export class AudioBufferCache {
  private cache: Map<string, Tone.ToneAudioBuffer>;

  constructor(private maxCacheSize?: number) {
    this.cache = new Map();
  }

  add(id: string, audioBuffer: Tone.ToneAudioBuffer) {
    if (this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(id, audioBuffer);
  }

  copy(oldId: string, newId: string) {
    if (this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    const buffer = this.cache.get(oldId);
    if (buffer) {
      this.cache.set(newId, buffer);
    }
  }

  get(id: string) {
    return this.cache.get(id) || null;
  }

  has(id: string) {
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

  getMemoryUsage() {
    let totalBytes = 0;

    for (const audioBuffer of this.cache.values()) {
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        totalBytes += channelData.length * Float32Array.BYTES_PER_ELEMENT;
      }
    }

    return totalBytes;
  }
}

export const audioBufferCache = new AudioBufferCache();
