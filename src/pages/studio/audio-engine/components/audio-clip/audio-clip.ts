import { ExtendedModel, idProp, model, modelAction, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { computed, observable } from "mobx";
import { audioBufferCache } from "../audio-buffer-cache";
import { waveformCache } from "../waveform-cache";
import { MAX_SAMPLES_PER_PIXEL, MIN_SAMPLES_PER_PIXEL } from "../../constants";
import { getPeaks } from "../audio-buffer-cache/helpers";

@model("AudioEngine/Mixer/Track/AudioClip")
export class AudioClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  type: prop("audio"),
  trackId: prop<string>(),
  start: prop<number>().withSetter(),
  loopSamples: prop<number>(0),
  fadeInSamples: prop<number>(0).withSetter(),
  fadeOutSamples: prop<number>(0).withSetter(),
}) {
  player = new Tone.Player().toDestination();
  private startEventId: number | null = null;
  private stopEventId: number | null = null;

  @observable
  buffer: Tone.ToneAudioBuffer | null = null;

  getRefId() {
    return this.id;
  }

  @computed
  get loaded(): boolean {
    return Boolean(this.buffer?.loaded && this.player?.loaded);
  }

  @computed
  get length(): number {
    return this.buffer?.length || 0;
  }

  @computed
  get end(): number {
    return this.start + this.length;
  }

  @modelAction
  setBuffer(buffer: Tone.ToneAudioBuffer) {
    this.buffer = buffer;
    this.setPlayerBuffer();
  }

  play = (time: Tone.Unit.Time, seekTime?: Tone.Unit.Time) => {
    if (this.player.loaded) {
      this.player.start(time, seekTime);
    }
  };

  stop = () => {
    this.player.stop();
  };

  schedule = () => {
    this.clearEvents();
    this.scheduleStart();
    this.scheduleStop();
  };

  @modelAction
  setLoopSamples(samples: number) {
    this.loopSamples = samples;
    this.setPlayerBuffer();
  }

  init() {
    const cachedBuffer = audioBufferCache.get(this.id);
    if (cachedBuffer) {
      this.setBuffer(cachedBuffer);
    }
  }

  createWaveformCache(buffer: Tone.ToneAudioBuffer) {
    for (let i = MIN_SAMPLES_PER_PIXEL; i <= MAX_SAMPLES_PER_PIXEL; i *= 2) {
      const peaks = getPeaks(buffer?.getChannelData(0), i);
      waveformCache.add(this.id, peaks, i);
    }
  }

  split(positionInSamples: number) {
    if (
      !this.buffer?.loaded ||
      positionInSamples < this.start ||
      positionInSamples > this.end
    ) {
      return;
    }

    const clipOne = {
      start: this.start,
      trackId: this.trackId,
      fadeInSamples: this.fadeInSamples,
      fadeOutSamples: 0,
      buffer: this.buffer?.slice(
        0,
        Tone.Time(positionInSamples - this.start, "samples").toSeconds()
      ),
    };
    const clipTwo = {
      start: positionInSamples,
      trackId: this.trackId,
      fadeInSamples: 0,
      fadeOutSamples: this.fadeOutSamples,
      buffer: this.buffer?.slice(
        Tone.Time(positionInSamples - this.start, "samples").toSeconds()
      ),
    };

    return { snapshots: [clipOne, clipTwo], clipIdToDelete: this.id };
  }

  private setPlayerBuffer() {
    if (this.buffer?.loaded) {
      this.player.buffer = this.concatenateBufferWithLoop();
    }
  }

  private scheduleStart = () => {
    const transport = Tone.getTransport();
    const startTimeInSeconds = Tone.Time(this.start, "samples").toSeconds();
    const seekTime = transport.seconds - startTimeInSeconds;
    const playEventId = transport.scheduleOnce((time) => {
      if (seekTime > 0) {
        this.play(Tone.now(), seekTime);
      } else {
        this.play(time);
      }
    }, startTimeInSeconds);
    this.startEventId = playEventId;
  };

  private scheduleStop = () => {
    const transport = Tone.getTransport();
    const endTimeInSeconds = Tone.Time(this.end, "samples").toSeconds();
    if (this.end) {
      const stopEventId = transport.scheduleOnce(() => {
        this.stop();
      }, endTimeInSeconds);
      this.stopEventId = stopEventId;
    }
  };

  private clearEvents = () => {
    const transport = Tone.getTransport();
    if (this.startEventId) {
      transport.clear(this.startEventId);
    }

    if (this.stopEventId) {
      transport.clear(this.stopEventId);
    }
  };

  private concatenateBufferWithLoop = (): Tone.ToneAudioBuffer => {
    if (!this.buffer) {
      throw new Error(`No audio buffer found for clip with id: ${this.id}`);
    }
    const sampleRate = Tone.getContext().sampleRate;

    this.loopSamples = Math.min(this.loopSamples, this.buffer.length);

    const totalLength = this.buffer.length + this.loopSamples;

    const audioContext = Tone.getContext().rawContext;
    const concatenatedBuffer = audioContext.createBuffer(
      1,
      totalLength,
      sampleRate
    );

    let offset = 0;

    concatenatedBuffer.copyToChannel(this.buffer.getChannelData(0), 0, offset);
    offset += this.buffer.length;

    concatenatedBuffer.copyToChannel(
      this.buffer.getChannelData(0).subarray(0, this.loopSamples),
      0,
      offset
    );

    return new Tone.ToneAudioBuffer(concatenatedBuffer);
  };

  sync() {
    if (!this.buffer) {
      const cachedBuffer = audioBufferCache.get(this.id);
      if (cachedBuffer) {
        this.setBuffer(cachedBuffer);
      }
    }

    this.player.fadeIn = Tone.Time(this.fadeInSamples, "samples").toSeconds();
    this.player.fadeOut = Tone.Time(this.fadeOutSamples, "samples").toSeconds();
  }

  dispose() {
    // TODO:
  }
}
