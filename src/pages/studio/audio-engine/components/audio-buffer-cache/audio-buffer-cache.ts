import * as Tone from "tone";

interface clearCacheOptions {
  only?: string[];
  except?: string[];
}

interface AddSamplesParams {
  path: string;
  samples: Record<string, Tone.ToneAudioBuffer>;
}

export class AudioBufferCache {
  private cache: Map<string, Tone.ToneAudioBuffer>;
  private loadedSamplePaths: string[];

  constructor(private maxCacheSize?: number) {
    this.cache = new Map();
    this.loadedSamplePaths = [];
  }

  add(id: string, audioBuffer: Tone.ToneAudioBuffer) {
    if (this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(id, audioBuffer);
  }

  copy(oldId: string, newId: string) {
    if (this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    const buffer = this.cache.get(oldId);
    if (buffer) {
      this.cache.set(newId, buffer);
    }
  }

  get(id: string) {
    return this.cache.get(id) || null;
  }

  has(key: string) {
    return this.cache.has(key) || this.loadedSamplePaths.includes(key);
  }

  remove(id: string) {
    this.cache.delete(id);
  }

  clear(options?: clearCacheOptions) {
    this.loadedSamplePaths = [];
    if (!options) {
      this.cache.clear();
      return;
    }

    const { only, except } = options;

    if (only && only.length > 0) {
      for (const key of only) {
        this.cache.delete(key);
      }
    } else if (except && except.length > 0) {
      for (const key of Array.from(this.cache.keys())) {
        if (!except.includes(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  size() {
    return this.cache.size;
  }

  addSamples(params: AddSamplesParams) {
    const { path, samples } = params;
    Object.keys(samples).map((note) => {
      const fullKey = `${path}/${note}`;
      const buffer = samples[note];
      this.add(fullKey, buffer);
    });
    this.loadedSamplePaths.push(path);
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
