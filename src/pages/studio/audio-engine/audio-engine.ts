import {
  model,
  prop,
  ExtendedModel,
  clone,
  fromSnapshot,
  idProp,
  createContext,
} from "mobx-keystone";
import { BaseAudioNodeWrapper } from "./base-audio-node-wrapper";
import {
  AudioClip,
  Mixer,
  Timeline,
  Clipboard,
  MidiClip,
  Metronome,
  AuxSendManager,
} from "./components";
import { audioBufferCache } from "./components/audio-buffer-cache";
import { action, observable } from "mobx";
import { AudioEngineState } from "./types";
import * as Tone from "tone";
import { Keyboard } from "./components";
import { MidiNote } from "./components/midi-note";
import { EventData } from "./components/keyboard/types";
import {
  blobToJsonObject,
  generateOfflineSends,
  populateBufferCache,
  unzipProjectFile,
} from "./helpers";
import JSZip from "jszip";
import { bufferToWav, isTouchDevice } from "../utils";
export const mixerCtx = createContext<Mixer>();

@model("AudioEngine")
export class AudioEngine extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  timeline: prop<Timeline>(() => new Timeline({})).withSetter(),
  mixer: prop<Mixer>(() => new Mixer({})).withSetter(),
  auxSendManager: prop<AuxSendManager>(
    () => new AuxSendManager({})
  ).withSetter(),
  keyboard: prop<Keyboard>(() => new Keyboard({})).withSetter(),
  metronome: prop<Metronome>(() => new Metronome({})).withSetter(),
  projectId: prop<string | undefined>().withSetter(),
  projectName: prop<string>("New Project").withSetter(),
}) {
  @observable
  state: AudioEngineState = AudioEngineState.stopped;
  clipboard = new Clipboard();

  async init() {
    mixerCtx.setDefaultComputed(() => this.mixer);
    const customAudioContext = new AudioContext({
      latencyHint: isTouchDevice() ? 0.5 : "playback",
    });

    Tone.setContext(customAudioContext);

    const start = async () => Tone.start();
    this.sync();

    await start();
  }

  getRefId() {
    return this.id;
  }

  @action
  private setState(state: AudioEngineState) {
    this.state = state;
  }

  record = async () => {
    const start = Tone.TransportTime(
      Tone.getTransport().seconds,
      "s"
    ).toSamples();
    this.setState(AudioEngineState.recording);
    const activeTracks = this.mixer.getActiveTracks();

    const transport = Tone.getTransport();

    const recorder = new Tone.Recorder();

    activeTracks.forEach((activeTrack) => {
      if (activeTrack.inputType === "mic") {
        activeTrack.mic.connect(recorder);
      }
    });

    await this.play();
    const shouldRecordAudio = this.mixer
      .getActiveTracks()
      .some((track) => track.inputType === "mic");
    if (shouldRecordAudio) {
      await recorder.start();
    }
    transport.once("stop", async () => {
      const recording = shouldRecordAudio ? await recorder.stop() : null;
      const url = recording ? URL.createObjectURL(recording) : null;
      const audioBuffer = url
        ? await new Tone.ToneAudioBuffer().load(url)
        : null;

      const stringifiedEvents = JSON.stringify(this.keyboard.events);

      activeTracks.forEach((track) => {
        if (track.inputType === "mic") {
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
        } else if (track.inputType === "midi") {
          if (this.keyboard.events.length) {
            const events = [
              ...JSON.parse(stringifiedEvents).map(
                (event: EventData) =>
                  new MidiNote({
                    ...event,
                    on: event.on - start,
                    off: event.off - start,
                  })
              ),
            ];
            const clip = new MidiClip({
              trackId: track.id,
              start,
              events: events.map((event) => clone(event)),
              end: Tone.TransportTime(
                Tone.getTransport().seconds,
                "s"
              ).toSamples(),
            });

            track.createMidiClip(clone(clip));
          }
        }
      });

      this.keyboard.clearRecordedEvents();

      activeTracks.forEach((activeTrack) => {
        if (activeTrack.inputType === "mic") {
          activeTrack.mic.disconnect(recorder);
        }
      });
      recorder.dispose();
    });
  };

  play = async () => {
    Tone.getTransport().start("+0.1");
    this.metronome.start();
    this.mixer.tracks.forEach((track) => track.play());
    if (this.state !== AudioEngineState.recording) {
      this.setState(AudioEngineState.playing);
    }
  };

  pause = async () => {
    this.mixer.tracks.forEach((track) =>
      track.instrument.releaseAll(Tone.now())
    );
    const transport = Tone.getTransport();
    this.metronome.stop();

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

  stop = () => {
    this.mixer.tracks.forEach((track) =>
      track.instrument.releaseAll(Tone.now())
    );
    const transport = Tone.getTransport();
    this.metronome.stop();
    transport.stop();
    transport.cancel();
    this.timeline.setSeconds(transport.seconds);
    this.setState(AudioEngineState.stopped);
  };

  async getProjectZip() {
    const clips = this.mixer.tracks
      .map((track) => track.clips)
      .flat()
      .filter((clip) => clip instanceof AudioClip);
    const mp3Promises = clips.map(async (clip: AudioClip, i) => {
      const buffer = audioBufferCache.get(clip.id);
      if (buffer) {
        // const file = await audioBufferToMp3(buffer, `${clip.id}`);
        const file = await bufferToWav(buffer, `${clip.id}`);

        return file;
      }
      throw new Error(`No buffer for clip: ${clip.id} at index: ${i}`);
    });

    const mp3Files = await Promise.all(mp3Promises);

    const projectData = this.serialize();
    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const settingsFile = new File([blob], "settings.json");

    const zip = new JSZip();
    mp3Files.forEach((file) => {
      zip.file(file.name, file);
    });
    zip.file(settingsFile.name, settingsFile);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${this.projectName}.zip`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  async loadProjectData(settings?: Record<string, unknown>) {
    if (settings) {
      const loadedTimeline = fromSnapshot(settings.timeline) as Timeline;
      const loadedMixer = fromSnapshot(settings.mixer) as Mixer;
      const loadedMetronome = fromSnapshot(settings.metronome) as Metronome;
      const loadedKeyboard = fromSnapshot(settings.keyboard) as Keyboard;
      const loadedProjectId = fromSnapshot(settings.projectId) as string;
      const loadedProjectName = fromSnapshot(settings.projectName) as string;

      loadedMixer.tracks.forEach((track) =>
        track.clips.forEach((clip) => {
          if (clip instanceof AudioClip) {
            const buffer = audioBufferCache.get(clip.id);
            if (buffer) {
              clip.createWaveformCache(buffer);
            } else {
              throw new Error("no buffer found");
            }
          }
        })
      );

      this.setTimeline(loadedTimeline);
      this.setMixer(loadedMixer);
      this.setKeyboard(loadedKeyboard);
      this.setProjectId(loadedProjectId);
      this.setProjectName(loadedProjectName);
      this.setMetronome(loadedMetronome);
      const loadedAuxSendManager = fromSnapshot(
        settings.auxSendManager
      ) as AuxSendManager;

      this.setAuxSendManager(loadedAuxSendManager);
    } else {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".zip";
      fileInput.style.display = "none";

      document.body.appendChild(fileInput);

      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const data = await unzipProjectFile(file);

        await populateBufferCache(data);

        document.body.removeChild(fileInput);

        const settingsBlob = data["settings.json"];

        if (settingsBlob) {
          const settings = await blobToJsonObject(settingsBlob);

          const loadedTimeline = fromSnapshot(settings.timeline) as Timeline;
          const loadedMixer = fromSnapshot(settings.mixer) as Mixer;
          const loadedMetronome = fromSnapshot(settings.metronome) as Metronome;
          const loadedKeyboard = fromSnapshot(settings.keyboard) as Keyboard;
          const loadedProjectId = fromSnapshot(settings.projectId) as string;
          const loadedProjectName = fromSnapshot(
            settings.projectName
          ) as string;

          loadedMixer.tracks.forEach((track) =>
            track.clips.forEach((clip) => {
              if (clip instanceof AudioClip) {
                const buffer = audioBufferCache.get(clip.id);
                if (buffer) {
                  clip.createWaveformCache(buffer);
                } else {
                  throw new Error("no buffer found");
                }
              }
            })
          );

          this.setTimeline(loadedTimeline);
          this.setMixer(loadedMixer);
          this.setKeyboard(loadedKeyboard);
          this.setProjectId(loadedProjectId);
          this.setProjectName(loadedProjectName);
          this.setMetronome(loadedMetronome);
          const loadedAuxSendManager = fromSnapshot(
            settings.auxSendManager
          ) as AuxSendManager;

          this.setAuxSendManager(loadedAuxSendManager);
        } else {
          throw new Error("No settings data found");
        }
      };

      fileInput.click();
    }
  }

  getBounceEndFromLastClip = (samplesPerPixel: number) => {
    const duration = this.mixer.getLastClipEndSamples() / samplesPerPixel;
    return duration;
  };

  async getOfflineBounce() {
    const duration = this.getBounceEndFromLastClip(
      Tone.getContext().sampleRate
    );

    const buffer = await Tone.Offline(
      () => {
        const clonedEngine = clone(this, { generateNewIds: false });
        generateOfflineSends(clonedEngine);
        clonedEngine.play();
      },
      duration,
      undefined,
      Tone.getContext().sampleRate
    );

    const wav = await bufferToWav(buffer, this.projectName);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(wav);
    link.download = `${this.projectName}.wav`;
    link.click();

    URL.revokeObjectURL(link.href);
  }
}
