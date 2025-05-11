import {
  clone,
  ExtendedModel,
  getParent,
  getRoot,
  idProp,
  model,
  modelAction,
  prop,
  Ref,
} from "mobx-keystone";
import { computed, observable, action } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { MidiNote } from "../midi-note";
import { PitchNameTuple } from "../midi-note/types";
import * as Tone from "tone";
import { Track } from "../track";
import { EventData } from "../keyboard/types";
import { MAX_SAMPLES_PER_PIXEL, MIN_SAMPLES_PER_PIXEL } from "../../constants";
import { noteRef } from "../refs";
import { AudioEngine } from "../../audio-engine";
import { AudioClip } from "../audio-clip";
import { audioBufferCache } from "../audio-buffer-cache";
import { Sampler } from "../sampler";

interface EventParams {
  on: number;
  off: number;
  note: PitchNameTuple;
  velocity?: number;
}

@model("AudioEngine/Mixer/Track/MidiClip")
export class MidiClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  trackId: prop<string>(),
  type: prop("midi"),
  start: prop<number>(),
  end: prop<number>(),
  events: prop<MidiNote[]>(() => []).withSetter(),
  loopSamples: prop<number>(0),
  locked: prop<boolean>(false).withSetter(),
  fadeInSamples: prop<number>(0).withSetter(),
  fadeOutSamples: prop<number>(0).withSetter(),
  samplesPerPixel: prop<number>(256).withSetter(),
  subdivision: prop("8n").withSetter(),
  snapToGrid: prop(false).withSetter(),
  selectedNoteRefs: prop<Ref<MidiNote>[]>(() => []),
  quantizePercentage: prop<number>(1),
  action: prop<"select" | "create">("select").withSetter(),
}) {
  @observable scheduledEventIds = new Map<
    string,
    { start: number; stop: number }
  >();

  @observable private eventTimingsCache = new Map<
    string,
    { startSeconds: number; endSeconds: number }
  >();

  @observable private batchUpdatePending = false;
  private batchUpdateTimer: ReturnType<typeof setTimeout> | null = null;

  @observable
  loading = false;

  startTicks = Tone.Time(this.start, "samples").toTicks();
  endTicks = Tone.Time(this.end, "samples").toTicks();

  getRefId() {
    return this.id;
  }

  @modelAction
  createEvent = (event: EventParams) => {
    const newEvent = new MidiNote({ ...event });
    this.setEvents([...this.events, clone(newEvent)]);
    this.requestBatchUpdate();
  };

  @modelAction
  deleteNote(event: MidiNote) {
    this.clearEventScheduling(event);

    this.setEvents([...this.events].filter((current) => current !== event));
    this.requestBatchUpdate();
  }

  @modelAction
  deleteSelectedNotes() {
    this.selectedNotes.forEach((note) => this.clearEventScheduling(note));

    const selectedIds = new Set(this.selectedNotes.map((note) => note.id));
    this.setEvents(
      [...this.events].filter((note) => !selectedIds.has(note.id))
    );
    this.selectedNoteRefs = [];

    this.requestBatchUpdate();
  }

  @action
  setLoading(state: boolean) {
    this.loading = state;
  }

  @action
  clearEventScheduling(event: MidiNote) {
    const eventKey = this.getEventKey(event);
    const scheduledIds = this.scheduledEventIds.get(eventKey);

    if (scheduledIds) {
      const transport = Tone.getTransport();
      if (scheduledIds.start) transport.clear(scheduledIds.start);
      if (scheduledIds.stop) transport.clear(scheduledIds.stop);
      this.scheduledEventIds.delete(eventKey);
    }

    this.eventTimingsCache.delete(eventKey);
  }

  private getEventKey(event: MidiNote): string {
    return `${event.id}_${event.on}_${event.off}`;
  }

  @action
  requestBatchUpdate() {
    if (!this.batchUpdatePending) {
      this.batchUpdatePending = true;

      if (this.batchUpdateTimer) clearTimeout(this.batchUpdateTimer);

      this.batchUpdateTimer = setTimeout(() => {
        this.processBatchUpdate();
        this.batchUpdateTimer = null;
      }, 0);
    }
  }

  @action
  processBatchUpdate() {
    this.batchUpdatePending = false;

    if (Tone.getTransport().state === "started") {
      this.schedule();
    }
  }

  samplesToPixels(samples: number) {
    return samples / this.samplesPerPixel;
  }

  pixelsToSamples(pixels: number) {
    return pixels * this.samplesPerPixel;
  }

  @computed
  get length(): number {
    return this.end - this.start;
  }

  @computed
  get startMeasure(): number {
    return parseInt(
      Tone.Time(this.start, "samples").toBarsBeatsSixteenths().split(":")[0]
    );
  }

  @computed
  get endMeasure(): number {
    return parseInt(
      Tone.Time(this.end, "samples").toBarsBeatsSixteenths().split(":")[0]
    );
  }

  @computed
  get measures() {
    return this.endMeasure - this.startMeasure + 1;
  }

  @computed
  get zoomWidth() {
    return this.samplesToPixels(Tone.Time(this.measures, "m").toSamples());
  }

  @computed
  get selectedNotes() {
    return this.selectedNoteRefs.map((r) => r.current);
  }

  @computed
  get canZoomIn(): boolean {
    return this.samplesPerPixel > MIN_SAMPLES_PER_PIXEL;
  }

  @computed
  get canZoomOut(): boolean {
    return this.samplesPerPixel < MAX_SAMPLES_PER_PIXEL / 2;
  }

  @computed
  get velocity(): number {
    if (this.selectedNotes.length) {
      return this.selectedNotes[0].velocity;
    }
    return 64;
  }

  setVelocity(velocity: number) {
    this.selectedNotes.forEach((note) => note.setVelocity(velocity));
    this.requestBatchUpdate();
  }

  zoomIn() {
    const newSPP = this.samplesPerPixel / 2;
    if (this.canZoomIn) {
      this.setSamplesPerPixel(newSPP);
    }
  }

  zoomOut() {
    const newSPP = this.samplesPerPixel * 2;
    if (this.canZoomOut) {
      this.setSamplesPerPixel(newSPP);
    }
  }

  @modelAction
  selectNote(note: MidiNote) {
    if (!this.events.includes(note)) throw new Error("unknown midi note");

    if (!this.selectedNotes.includes(note)) {
      this.selectedNoteRefs.push(noteRef(note));
    }
  }

  setStartAndEndFromTicks() {
    const currentTickOnTimeInSamples = Tone.Ticks(this.startTicks).toSamples();
    const currentTickOffTimeInSamples = Tone.Ticks(this.endTicks).toSamples();

    this.setStart(currentTickOnTimeInSamples);
    this.setEnd(currentTickOffTimeInSamples);
  }

  @modelAction
  unselectNote(note: MidiNote) {
    if (!this.events.includes(note)) throw new Error("unknown midi note");

    const trackRefIndex = this.selectedNoteRefs.findIndex(
      (noteRef) => noteRef.maybeCurrent === note
    );

    if (trackRefIndex >= 0) {
      this.selectedNoteRefs.splice(trackRefIndex, 1);
    }
  }

  @modelAction
  selectAllNotes() {
    this.events.forEach((note) => this.selectNote(note));
  }

  @modelAction
  unselectAllNotes() {
    this.events.forEach((note) => this.unselectNote(note));
  }

  @modelAction
  setQuantizePercentage(percentage: number) {
    if (percentage >= 0 && percentage <= 100) {
      this.quantizePercentage = percentage;
    }
  }

  @modelAction
  setStart(newStart: number) {
    this.startTicks = Tone.Time(newStart, "samples").toTicks();
    const difference = newStart - this.start;
    this.setEnd(this.end + difference);
    this.start = newStart;

    this.eventTimingsCache.clear();
    this.requestBatchUpdate();
  }

  @modelAction
  setEnd(newEnd: number) {
    this.endTicks = Tone.Time(newEnd, "samples").toTicks();
    this.end = newEnd;
    this.eventTimingsCache.clear();
    this.requestBatchUpdate();
  }

  @modelAction
  setLoopSamples(samples: number) {
    this.loopSamples = samples;
    this.requestBatchUpdate();
  }

  play = () => {
    this.schedule();
  };

  stop() {
    this.clearEvents();
  }

  @modelAction
  quantizeSelectedNotes() {
    this.selectedNotes.forEach((note) =>
      note.quantize(this.start, this.subdivision, this.quantizePercentage)
    );
    this.requestBatchUpdate();
  }

  @modelAction
  quantizeSelectedOn() {
    this.selectedNotes.forEach((note) =>
      note.quantizeOn(this.start, this.subdivision, this.quantizePercentage)
    );
    this.requestBatchUpdate();
  }

  @modelAction
  quantizeSelectedOff() {
    this.selectedNotes.forEach((note) =>
      note.quantizeOff(this.start, this.subdivision, this.quantizePercentage)
    );
    this.requestBatchUpdate();
  }

  private calculateEventTiming(event: MidiNote) {
    const eventKey = this.getEventKey(event);

    if (this.eventTimingsCache.has(eventKey)) {
      return this.eventTimingsCache.get(eventKey)!;
    }

    const startTimeInSeconds = Tone.Time(
      event.on + this.start,
      "samples"
    ).toSeconds();
    const endTimeInSeconds = Tone.Time(
      event.off + this.start,
      "samples"
    ).toSeconds();

    const timing = {
      startSeconds: startTimeInSeconds,
      endSeconds: endTimeInSeconds,
    };
    this.eventTimingsCache.set(eventKey, timing);

    return timing;
  }

  schedule() {
    this.clearEvents();
    const parentTrack: Track | undefined = getParent(getParent(this)!);
    if (!parentTrack) {
      throw new Error("No parent track found");
    }

    const transport = Tone.getTransport();
    const loopEnd = this.start + this.length + this.loopSamples;
    const loopLengthInSamples = this.length;

    const iterationsNeeded =
      this.loopSamples > 0 ? Math.ceil(this.loopSamples / this.length) + 1 : 1;

    const eventsByNote = new Map<string, MidiNote[]>();

    this.events.forEach((event) => {
      const noteKey = event.note.join("");
      if (!eventsByNote.has(noteKey)) {
        eventsByNote.set(noteKey, []);
      }
      eventsByNote.get(noteKey)!.push(event);
    });

    eventsByNote.forEach((eventsForNote, noteKey) => {
      eventsForNote.forEach((event) => {
        const { startSeconds: baseStartSeconds, endSeconds: baseEndSeconds } =
          this.calculateEventTiming(event);

        const eventKey = this.getEventKey(event);
        const scheduledIds = { start: 0, stop: 0 };

        for (let i = 0; i < iterationsNeeded; i++) {
          const loopOffsetSeconds = Tone.Time(
            i * loopLengthInSamples,
            "samples"
          ).toSeconds();

          const startTimeInSeconds = baseStartSeconds + loopOffsetSeconds;
          const endTimeInSeconds = baseEndSeconds + loopOffsetSeconds;

          const startTimeInSamples = Tone.Time(startTimeInSeconds).toSamples();
          const endTimeInSamples = Tone.Time(endTimeInSeconds).toSamples();

          if (startTimeInSamples < loopEnd) {
            const startEventId = transport.scheduleOnce(
              (time) =>
                parentTrack.instrument?.triggerAttack(
                  noteKey,
                  time,
                  event.velocity
                ),
              startTimeInSeconds
            );

            if (endTimeInSamples <= loopEnd) {
              const stopEventId = transport.scheduleOnce(
                (time) => parentTrack.instrument?.triggerRelease(noteKey, time),
                endTimeInSeconds
              );

              if (i === 0) {
                scheduledIds.stop = stopEventId;
              }
            }

            if (i === 0) {
              scheduledIds.start = startEventId;
            }
          }
        }

        this.scheduledEventIds.set(eventKey, scheduledIds);
      });
    });
  }

  clearEvents = () => {
    const transport = Tone.getTransport();

    this.scheduledEventIds.forEach((ids) => {
      if (ids.start) transport.clear(ids.start);
      if (ids.stop) transport.clear(ids.stop);
    });

    this.scheduledEventIds.clear();
  };

  split(positionInSamples: number) {
    const adjustedPosition = positionInSamples - this.start;

    const difference = positionInSamples - adjustedPosition;
    const splitEvents = JSON.parse(JSON.stringify([...this.events]))
      .filter(
        (event: { ["$"]: EventData }) =>
          event["$"].on < adjustedPosition && event["$"].off > adjustedPosition
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

    const clipOne = {
      start: this.start,
      end: positionInSamples,
      trackId: this.trackId,
      fadeInSamples: this.fadeInSamples,
      fadeOutSamples: 0,
      events: [
        ...this.events
          .concat(splitEvents.flat())
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
      end: this.end,
      trackId: this.trackId,
      fadeInSamples: 0,
      fadeOutSamples: this.fadeOutSamples,
      events: [
        ...this.events
          .concat(splitEvents.flat())
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

    return {
      snapshots: [{ ...clipOne }, { ...clipTwo }],
      clipIdToDelete: this.id,
    };
  }

  async convertToAudioClip() {
    this.setLoading(true);
    const { mixer } = getRoot<AudioEngine>(this);

    const parentTrack = mixer.tracks.find((track) => track.id === this.trackId);
    if (!parentTrack?.instrument) return;

    const duration = (this.end - this.start) / Tone.getContext().sampleRate;

    const audioBuffer = await Tone.Offline(async (context) => {
      if (parentTrack.instrument) {
        const instrumentClone = clone(parentTrack.instrument);
        if (instrumentClone instanceof Sampler) {
          await instrumentClone.loadSamples();

          instrumentClone.output.toDestination();

          const sortedEvents = [...this.events].sort((a, b) => a.on - b.on);

          sortedEvents.forEach((event) => {
            const startTime = event.on / Tone.getContext().sampleRate;
            const duration =
              (event.off - event.on) / Tone.getContext().sampleRate;

            context.transport.scheduleOnce((time) => {
              instrumentClone.triggerAttackRelease(
                event.note.join(""),
                duration,
                time,
                event.velocity
              );
            }, startTime);
          });
          context.transport.start();
        } else {
          instrumentClone.output.toDestination();

          const sortedEvents = [...this.events].sort((a, b) => a.on - b.on);

          sortedEvents.forEach((event) => {
            const startTime = event.on / Tone.getContext().sampleRate;
            const duration =
              (event.off - event.on) / Tone.getContext().sampleRate;

            context.transport.scheduleOnce((time) => {
              instrumentClone.triggerAttackRelease(
                event.note.join(""),
                duration,
                time,
                event.velocity
              );
            }, startTime);
          });
          context.transport.start();
        }
      }
    }, duration);

    const monoBuffer = audioBuffer.toMono();

    const { loopSamples, fadeInSamples, fadeOutSamples } = this;

    const clip = new AudioClip({
      trackId: this.trackId,
      start: this.start,
      loopSamples,
      fadeInSamples,
      fadeOutSamples,
      midiNotes: [...this.events].map((event) => clone(event)),
    });

    audioBufferCache.add(clip.id, monoBuffer);
    clip.setBuffer(monoBuffer);
    clip.createWaveformCache(monoBuffer);

    this.dispose();
    parentTrack.deleteClip(this);
    parentTrack.createAudioClip(clip);
    this.setLoading(false);

    return clip;
  }

  dispose() {
    this.clearEvents();

    if (this.batchUpdateTimer) {
      clearTimeout(this.batchUpdateTimer);
      this.batchUpdateTimer = null;
    }

    this.eventTimingsCache.clear();
    this.scheduledEventIds.clear();
  }
}
