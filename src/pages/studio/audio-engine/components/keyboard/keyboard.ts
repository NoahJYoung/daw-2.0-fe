import { model, prop, ExtendedModel } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Octave, PitchNameTuple } from "../midi-note/types";
import { EventData, OnEventData } from "./types";
import * as Tone from "tone";
import { AudioEngineState } from "../../types";
import { action, observable } from "mobx";
import { Mixer } from "../mixer";

@model("AudioEngine/Keyboard")
export class Keyboard extends ExtendedModel(BaseAudioNodeWrapper, {
  baseOctave: prop<Octave>(3).withSetter(),
}) {
  @observable
  events: EventData[] = [];

  @observable
  onEvents: OnEventData[] = [];

  @action
  setEvents(events: EventData[]) {
    this.events = events;
  }

  @action
  setOnEvents(events: OnEventData[]) {
    this.onEvents = events;
  }

  attack(pitchTuple: PitchNameTuple, mixer: Mixer, state: AudioEngineState) {
    const pitch = pitchTuple.join("");

    const event: OnEventData = {
      note: pitchTuple,
      on: Tone.Time(Tone.getTransport().seconds, "s").toSamples(),
    };

    const activeTracksWithKeyboardInput = mixer.tracks.filter(
      (track) => track.active && track.input === "midi"
    );

    activeTracksWithKeyboardInput.forEach((track) =>
      track.instrument.triggerAttack(pitch, Tone.now())
    );

    if (state === AudioEngineState.recording) {
      const newOnEvents = [...this.onEvents, event];
      this.setOnEvents(newOnEvents);
    }
  }

  release(pitchTuple: PitchNameTuple, mixer: Mixer, state: AudioEngineState) {
    const pitch = pitchTuple.join("");

    const activeTracksWithKeyboardInput = mixer.tracks.filter(
      (track) => track.active && track.input === "midi"
    );

    activeTracksWithKeyboardInput.forEach((track) =>
      track.instrument.triggerRelease(pitch, Tone.now())
    );

    const onEventIndex = this.onEvents.findIndex(
      (event) => event.note.join("") === pitchTuple.join("")
    );

    if (onEventIndex !== -1) {
      const onEvent = this.onEvents[onEventIndex];
      const event: EventData = {
        ...onEvent,
        off: Tone.Time(Tone.getTransport().seconds, "s").toSamples(),
      };

      if (state === AudioEngineState.recording) {
        const newEvents = [...this.events, event];
        this.setEvents(newEvents);

        const newOnEvents = this.onEvents.filter(
          (_, index) => index !== onEventIndex
        );
        this.setOnEvents(newOnEvents);
      }
    }
  }

  clearRecordedEvents() {
    this.setEvents([]);
    this.setOnEvents([]);
  }
}
