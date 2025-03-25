import {
  clone,
  ExtendedModel,
  getRoot,
  idProp,
  model,
  modelAction,
  prop,
} from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { action, computed, observable } from "mobx";
import { audioBufferCache } from "../audio-buffer-cache";
import { waveformCache } from "../waveform-cache";
import { MAX_SAMPLES_PER_PIXEL, MIN_SAMPLES_PER_PIXEL } from "../../constants";
import { getPeaks } from "../audio-buffer-cache/helpers";
import * as Tone from "tone";
import { MidiNote } from "../midi-note";
import { AudioEngine } from "../../audio-engine";
import { MidiClip } from "../midi-clip";
import { EventData } from "../keyboard/types";

@model("AudioEngine/Mixer/Track/AudioClip")
export class AudioClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  type: prop("audio"),
  trackId: prop<string>(),
  start: prop<number>().withSetter(),
  loopSamples: prop<number>(0),
  locked: prop<boolean>(false).withSetter(),
  fadeInSamples: prop<number>(0).withSetter(),
  fadeOutSamples: prop<number>(0).withSetter(),
  bufferCacheKey: prop<string | null>(null).withSetter(),
  midiNotes: prop<MidiNote[]>(() => []),
}) {
  player = new Tone.Player();

  @observable
  loading = false;

  canConvertToMidi = !!this.midiNotes && this.midiNotes.length;

  @observable
  private startEventId: number | null = null;

  @observable
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

  @action
  setLoading(state: boolean) {
    this.loading = state;
  }

  play = (time: Tone.Unit.Time, seekTime?: Tone.Unit.Time) => {
    if (this.player.loaded) {
      this.player.start(time, seekTime);
    }
  };

  stop = (time: Tone.Unit.Time) => {
    this.player.stop(time);
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
    if (!this.bufferCacheKey) {
      this.setBufferCacheKey(this.id);
    }
    const cachedBuffer = audioBufferCache.get(this.bufferCacheKey || this.id);
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
    const adjustedPosition = positionInSamples - this.start;
    const difference = positionInSamples - adjustedPosition;

    const getSplitEvents = () => {
      if (!this.midiNotes) {
        return;
      }

      const splitEvents = JSON.parse(JSON.stringify([...this.midiNotes]))
        .filter(
          (event: { ["$"]: EventData }) =>
            event["$"].on < adjustedPosition &&
            event["$"].off > adjustedPosition
        )
        .map((event: { ["$"]: EventData }) => [
          {
            on: event["$"].on,
            off: adjustedPosition,
            velocity: event["$"].velocity,
            note: [...event["$"].note],
          },

          {
            on: adjustedPosition,
            off: event["$"].off,
            velocity: event["$"].velocity,
            note: [...event["$"].note],
          },
        ]);
      return splitEvents;
    };

    const splitMidiNotes = getSplitEvents();

    const clipOne = {
      start: this.start,
      trackId: this.trackId,
      fadeInSamples: this.fadeInSamples,
      fadeOutSamples: 0,
      buffer: this.buffer?.slice(
        0,
        Tone.Time(positionInSamples - this.start, "samples").toSeconds()
      ),
      midiNotes: [
        ...this.midiNotes
          .concat(splitMidiNotes.flat())
          .filter(
            (event) =>
              event.on < adjustedPosition && event.off <= adjustedPosition
          )
          .map((event) =>
            clone(
              new MidiNote({
                note: [...event.note],
                velocity: event.velocity,
                on: event.on,
                off: event.off,
              })
            )
          ),
      ],
    };
    const clipTwo = {
      start: positionInSamples,
      trackId: this.trackId,
      fadeInSamples: 0,
      fadeOutSamples: this.fadeOutSamples,
      buffer: this.buffer?.slice(
        Tone.Time(positionInSamples - this.start, "samples").toSeconds()
      ),
      midiNotes: [
        ...this.midiNotes
          .concat(splitMidiNotes.flat())
          .filter((event) => event.on >= adjustedPosition)
          .map((event) =>
            clone(
              new MidiNote({
                note: [...event.note],
                velocity: event.velocity,
                on: event.on - positionInSamples + difference,
                off: event.off - positionInSamples + difference,
              })
            )
          ),
      ],
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
        this.play(time, seekTime);
      } else {
        this.play(time);
      }
    }, startTimeInSeconds);
    this.setStartEventId(playEventId);
  };

  @action
  setStartEventId(eventId: number | null) {
    this.startEventId = eventId;
  }

  @action
  setStopEventId(eventId: number | null) {
    this.stopEventId = eventId;
  }

  private scheduleStop = () => {
    const transport = Tone.getTransport();
    const endTimeInSeconds = Tone.Time(
      this.end + this.loopSamples,
      "samples"
    ).toSeconds();
    if (this.end) {
      const stopEventId = transport.scheduleOnce((time) => {
        this.stop(time);
      }, endTimeInSeconds);
      this.setStopEventId(stopEventId);
    }
  };

  clearEvents = () => {
    const transport = Tone.getTransport();
    if (this.startEventId) {
      transport.clear(this.startEventId);
      this.setStartEventId(null);
    }

    if (this.stopEventId) {
      transport.clear(this.stopEventId);
      this.setStopEventId(null);
    }
  };

  private concatenateBufferWithLoop = (): Tone.ToneAudioBuffer => {
    if (!this.buffer) {
      throw new Error(`No audio buffer found for clip with id: ${this.id}`);
    }

    const sampleRate = Tone.getContext().sampleRate;
    const bufferLength = this.buffer.length;
    let loopSamples = this.loopSamples;

    const totalLength = bufferLength + loopSamples;

    const audioContext = Tone.getContext().rawContext;
    const concatenatedBuffer = audioContext.createBuffer(
      1,
      totalLength,
      sampleRate
    );

    let offset = 0;

    concatenatedBuffer.copyToChannel(this.buffer.getChannelData(0), 0, offset);
    offset += bufferLength;

    while (loopSamples > 0) {
      const copyLength = Math.min(loopSamples, bufferLength);
      concatenatedBuffer.copyToChannel(
        this.buffer.getChannelData(0).subarray(0, copyLength),
        0,
        offset
      );
      offset += copyLength;
      loopSamples -= copyLength;
    }

    return new Tone.ToneAudioBuffer(concatenatedBuffer);
  };

  async convertToMidiClip() {
    if (!this.canConvertToMidi || !this.midiNotes) {
      return;
    }
    const { mixer } = getRoot<AudioEngine>(this);

    const parentTrack = mixer.tracks.find((track) => track.id === this.trackId);
    if (!parentTrack) return;

    const { loopSamples, fadeInSamples, fadeOutSamples } = this;

    const clip = new MidiClip({
      trackId: this.trackId,
      start: this.start,
      end: this.end,
      loopSamples,
      fadeInSamples,
      fadeOutSamples,
      events: [...this.midiNotes].map((event) => clone(event)),
    });

    parentTrack.createMidiClip(clip);
    parentTrack.deleteClip(this);
  }

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
