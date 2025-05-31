import * as Tone from "tone";

export class LatencyCalibrator {
  readonly audioLatencyStorageKey: string = "audio_latency_offset";
  readonly midiNoteLatencyStorageKey: string = "midi_note_latency_offset";

  // private userMedia: Tone.UserMedia = new Tone.UserMedia();
  // private recorder: Tone.Recorder = new Tone.Recorder();
  // private testSignal: Tone.Oscillator = new Tone.Oscillator(440, "sine");

  // async calibrate(): Promise<number> {
  //   try {
  //     const latency = await this.performLatencyTest();
  //     this.cleanup();
  //     console.log("LATENCY IN MS: ", latency);
  //     return latency;
  //   } catch (error) {
  //     console.error("Calibration failed:", error);
  //     this.cleanup();
  //     return 50;
  //   }
  // }

  // // TODO: Fix this function as it does not provide correct results
  // private async performLatencyTest(): Promise<number> {
  //   this.testSignal.toDestination();
  //   await this.userMedia.open();
  //   this.userMedia.connect(this.recorder);

  //   this.recorder.start();
  //   this.testSignal.start();
  //   await this.delay(2000);

  //   this.testSignal.stop();
  //   this.testSignal.disconnect();
  //   const recording = await this.recorder.stop();
  //   const buffer = await blobToAudioBuffer(recording);
  //   const peakIndex = this.findSignalPeak(buffer);

  //   const latency = Tone.Time(peakIndex, "samples").toMilliseconds();
  //   return latency;
  // }

  // private delay(ms: number): Promise<void> {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  // private findSignalPeak(buffer: Tone.ToneAudioBuffer): number {
  //   const audioData = buffer.toArray(0) as Float32Array;
  //   let maxAmplitude = 0;
  //   let peakIndex = -1;
  //   const threshold = 0.1;

  //   for (let i = 0; i < audioData.length; i++) {
  //     const amplitude = Math.abs(audioData[i]);
  //     if (amplitude > threshold && amplitude > maxAmplitude) {
  //       maxAmplitude = amplitude;
  //       peakIndex = i;
  //     }
  //     if (peakIndex > -1 && amplitude < maxAmplitude * 0.5) {
  //       break;
  //     }
  //   }

  //   return peakIndex;
  // }

  // private cleanup(): void {
  //   if (this.userMedia) {
  //     this.userMedia.close();
  //     this.userMedia.dispose();
  //   }
  //   if (this.recorder) {
  //     this.recorder.dispose();
  //   }
  //   if (this.testSignal) {
  //     this.testSignal.dispose();
  //   }
  // }

  loadFromStorage(key: "audio" | "midi" = "audio"): number {
    const storageKey =
      key === "audio"
        ? this.audioLatencyStorageKey
        : this.midiNoteLatencyStorageKey;
    try {
      const data = localStorage.getItem(storageKey);
      return data ? parseInt(data) : 0;
    } catch (e) {
      console.warn("Could not load latency calibration:", e);
      return 0;
    }
  }

  saveToStorage(data: number, key: "audio" | "midi" = "audio"): void {
    const storageKey =
      key === "audio"
        ? this.audioLatencyStorageKey
        : this.midiNoteLatencyStorageKey;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save latency calibration:", e);
    }
  }

  getCompensatedBuffer(
    recordedBuffer: Tone.ToneAudioBuffer,
    latencyMs: number
  ): Tone.ToneAudioBuffer {
    return recordedBuffer.slice(latencyMs / 1000);
  }
}
