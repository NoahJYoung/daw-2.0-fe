import { model, prop, ExtendedModel, clone } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "./base-audio-node-wrapper";
import { AudioClip, Mixer, Timeline, Clipboard, MidiClip } from "./components";
import { audioBufferCache } from "./components/audio-buffer-cache";
import { action, observable } from "mobx";
import { AudioEngineState } from "./types";
import * as Tone from "tone";
import { Keyboard } from "./components";
import { MidiNote } from "./components/midi-note";

@model("AudioEngine")
export class AudioEngine extends ExtendedModel(BaseAudioNodeWrapper, {
  timeline: prop<Timeline>(() => new Timeline({})),
  mixer: prop<Mixer>(() => new Mixer({})),
  keyboard: prop<Keyboard>(() => new Keyboard({})),
  projectId: prop<string | undefined>().withSetter(),
  projectName: prop<string>("New Project").withSetter(),
}) {
  @observable
  state: AudioEngineState = AudioEngineState.stopped;
  clipboard = new Clipboard();

  init() {}

  @action
  private setState(state: AudioEngineState) {
    this.state = state;
  }

  record = async () => {
    const start = Tone.Time(Tone.getTransport().seconds, "s").toSamples();
    this.setState(AudioEngineState.recording);
    const activeTracks = this.mixer.getActiveTracks();

    const transport = Tone.getTransport();

    const recorder = new Tone.Recorder();

    activeTracks.forEach((activeTrack) => {
      if (activeTrack.input === "mic") {
        activeTrack.mic.connect(recorder);
      }
    });

    await this.play();
    const shouldRecordAudio = this.mixer
      .getActiveTracks()
      .some((track) => track.input === "mic");
    if (shouldRecordAudio) {
      await recorder.start();
    }
    transport.once("stop", async () => {
      const recording = shouldRecordAudio ? await recorder.stop() : null;
      const url = recording ? URL.createObjectURL(recording) : null;
      const audioBuffer = url
        ? await new Tone.ToneAudioBuffer().load(url)
        : null;

      activeTracks.forEach((track) => {
        if (track.input === "mic") {
          const clip = new AudioClip({
            trackId: track.id,
            start,
          });

          if (audioBuffer) {
            audioBufferCache.add(clip.id, audioBuffer.toMono());
            clip.setBuffer(audioBuffer);

            clip.createWaveformCache(audioBuffer);
          }

          track.createAudioClip(clip);
          // TODO: Fix this bug that sometimes causes Midi Clip creation to fail
        } else if (track.input === "midi") {
          if (this.keyboard.events.length) {
            const clip = new MidiClip({
              trackId: track.id,
              start,
              events: this.keyboard.events.map(
                (event) =>
                  new MidiNote({
                    ...event,
                    on: event.on - start,
                    off: event.off - start,
                  })
              ),
              end: Tone.Time(Tone.getTransport().seconds, "s").toSamples(),
            });

            track.createMidiClip(clone(clip));
          }
        }
        this.keyboard.clearRecordedEvents();
      });

      activeTracks.forEach((activeTrack) => {
        if (activeTrack.input === "mic") {
          activeTrack.mic.disconnect(recorder);
        }
      });
      recorder.dispose();
    });
  };

  play = async () => {
    Tone.start();
    this.mixer.tracks.forEach((track) => track.play());
    Tone.getTransport().start();
    if (this.state !== AudioEngineState.recording) {
      this.setState(AudioEngineState.playing);
    }
  };

  pause = async () => {
    this.mixer.tracks.forEach((track) =>
      track.instrument.releaseAll(Tone.now())
    );
    const transport = Tone.getTransport();
    const seconds = transport.seconds;
    this.mixer.tracks.forEach((track) => track.stop());

    transport.pause();
    if (this.state === AudioEngineState.recording) {
      this.stop();
      transport.seconds = seconds;
      this.timeline.setSeconds(transport.seconds);
    }
    this.setState(AudioEngineState.paused);
  };

  stop = async () => {
    this.mixer.tracks.forEach((track) =>
      track.instrument.releaseAll(Tone.now())
    );
    const transport = Tone.getTransport();
    transport.stop();
    this.timeline.setSeconds(transport.seconds);
    this.setState(AudioEngineState.stopped);
  };
}
