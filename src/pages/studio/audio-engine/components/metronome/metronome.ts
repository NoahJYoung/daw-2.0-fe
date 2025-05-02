import { model, ExtendedModel, getRoot, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { action, computed, observable } from "mobx";
import { AudioEngine } from "../../audio-engine";
import * as Tone from "tone";
import { audioBufferCache } from "../audio-buffer-cache";
import { blobToAudioBuffer } from "../../helpers";

@model("AudioEngine/Metronome")
export class Metronome extends ExtendedModel(BaseAudioNodeWrapper, {
  active: prop<boolean>(false).withSetter(),
}) {
  private channel = new Tone.Channel();
  voice: Tone.Sampler | null = null;

  async init() {
    this.channel.set({ mute: !this.active });
    this.channel.toDestination();
    this.voice = new Tone.Sampler().connect(this.channel);
    await this.loadSample();
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
  private loadSamplesFromCache() {
    const buffer = audioBufferCache.get("/sounds/metronome.wav");

    if (buffer) {
      this.voice?.add("C5", buffer);
    }
  }

  async loadSample() {
    if (audioBufferCache.has("/sounds/metronome.wav")) {
      this.loadSamplesFromCache();
    } else {
      try {
        const response = await fetch("/sounds/metronome.wav");
        const blob = await response.blob();
        const audioBuffer = await blobToAudioBuffer(blob);

        audioBufferCache.add("/sounds/metronome.wav", audioBuffer);
        this.loadSamplesFromCache();
      } catch (error) {
        console.error("Error loading instrument:", error);
      }
    }
  }

  @action
  setEventId(id: number | null) {
    this.eventId = id;
  }
}
