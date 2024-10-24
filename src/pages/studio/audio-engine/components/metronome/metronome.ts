import { model, ExtendedModel, getRoot, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { action, computed, observable } from "mobx";
import { AudioEngine } from "../../audio-engine";
import * as Tone from "tone";

@model("AudioEngine/Metronome")
export class Metronome extends ExtendedModel(BaseAudioNodeWrapper, {
  active: prop<boolean>(false).withSetter(),
}) {
  private channel = new Tone.Channel();
  voice = new Tone.PluckSynth().connect(this.channel);

  init() {
    this.channel.set({ mute: !this.active });
    this.channel.toDestination();
  }

  sync() {
    this.channel.set({ mute: !this.active });
  }

  @observable
  eventId: number | null = null;

  @computed
  get timeSignature() {
    return getRoot<AudioEngine>(this).timeline.timeSignature;
  }

  @computed
  get subdivision() {
    return getRoot<AudioEngine>(this).timeline.subdivision;
  }

  @computed
  get bpm() {
    return getRoot<AudioEngine>(this).timeline.bpm;
  }

  start() {
    const pulse = this.timeSignature % 1 === 0 ? "4n" : "8n";
    Tone.getTransport().cancel();
    const eventId = Tone.getTransport().scheduleRepeat(
      (time) => {
        this.voice.triggerAttackRelease("C5", "8n", time);
      },
      pulse,
      "0m"
    );
    this.setEventId(eventId);
  }

  stop() {
    if (this.eventId) {
      Tone.getTransport().cancel();
      this.setEventId(null);
    }
  }

  @action
  setEventId(id: number | null) {
    this.eventId = id;
  }
}
