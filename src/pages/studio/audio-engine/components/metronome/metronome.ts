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
  voice: Tone.Sampler | null = null;

  init() {
    this.channel.set({ mute: !this.active });
    this.channel.toDestination();
    this.voice = new Tone.Sampler({ C5: "/sounds/metronome.wav" }, () =>
      console.log("sample loaded")
    ).connect(this.channel);
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
    const position = Tone.getTransport().position.toString();
    const [bars, beats] = position.split(":");

    let barCounter = beats === "0" ? -1 : parseInt(bars);

    const eventId = Tone.getTransport().scheduleRepeat(
      (time) => {
        const position = Tone.getTransport().position.toString();
        const [bars] = position.split(":");
        const currentBars = parseInt(bars);
        const isFirstBeat = barCounter !== currentBars;
        this.voice?.triggerAttackRelease(isFirstBeat ? "G5" : "C5", 0.1, time);
        barCounter = currentBars;
      },
      pulse,
      "0m"
    );
    this.setEventId(eventId);
  }

  stop() {
    if (this.eventId) {
      Tone.getTransport().clear(this.eventId);
      this.setEventId(null);
    }
  }

  @action
  setEventId(id: number | null) {
    this.eventId = id;
  }
}
