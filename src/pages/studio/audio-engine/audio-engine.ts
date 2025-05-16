/* eslint-disable no-async-promise-executor */
import {
  model,
  prop,
  ExtendedModel,
  clone,
  fromSnapshot,
  idProp,
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
  addInitialSamplesToCache,
  blobToJsonObject,
  populateBufferCache,
  unzipProjectFile,
} from "./helpers";
import JSZip from "jszip";
import { bufferToWav } from "../utils";
import { Sampler } from "./components/sampler";

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
  key: prop<string>("C").withSetter(),
  projectId: prop<string | undefined>().withSetter(),
  projectName: prop<string>("New Project").withSetter(),
}) {
  @observable
  state: AudioEngineState = AudioEngineState.stopped;
  clipboard = new Clipboard();

  @observable
  loaded = false;

  @observable
  loadingState: string | null = "Initializing";

  @observable
  playDisabled: boolean = false;

  async init() {
    this.sync();
    await Tone.loaded();
    this.setLoadingState(null);
  }

  getRefId() {
    return this.id;
  }

  @action
  private setState(state: AudioEngineState) {
    this.state = state;
  }

  private loadingTimeout: NodeJS.Timeout | null = null;
  private loadingStartTime: number | null = null;

  @action
  setLoadingState(state: string | null): void {
    if (state !== null) {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }

      this.loadingStartTime = Date.now();

      this.loadingState = state;
      if (state !== "Bouncing") {
        this.setPlayDisabled(true);
      }
    } else {
      if (this.loadingStartTime === null) {
        this.loadingStartTime = Date.now();
      }

      const timeElapsed = Date.now() - this.loadingStartTime;
      const remainingTime = Math.max(0, 300 - timeElapsed);

      if (remainingTime > 0) {
        this.loadingTimeout = setTimeout(() => {
          this.setLoadingState(null);
          this.setPlayDisabled(false);
          this.loadingStartTime = null;
          this.loadingTimeout = null;
        }, remainingTime);
      } else {
        this.loadingState = null;
        this.setPlayDisabled(false);
        this.loadingStartTime = null;
      }
    }
  }

  @action
  setPlayDisabled(state: boolean) {
    this.playDisabled = state;
  }

  record = async () => {
    if (this.playDisabled) {
      return;
    }
    const start = Tone.TransportTime(
      Tone.getTransport().seconds,
      "s"
    ).toSamples();
    this.setState(AudioEngineState.recording);
    const activeTracks = this.mixer.getActiveTracks();

    const transport = Tone.getTransport();

    const recorder = new Tone.Recorder();
    // const osc = new Tone.Oscillator(1, "sine").set({
    //   volume: -Infinity,
    // });

    activeTracks.forEach((activeTrack) => {
      if (activeTrack.inputType === "mic") {
        activeTrack.mic.connect(recorder);
      } else if (activeTrack.inputType === "sends") {
        activeTrack.channel.connect(activeTrack.recorder);
        // osc.connect(activeTrack.recorder);
        // // osc.start();
        activeTrack.recorder.start();
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

      activeTracks
        .filter(
          (track) =>
            track.inputType === "sends" &&
            !!this.auxSendManager.getReceivesByTrack(track).length
        )
        .forEach(async (track) => {
          const sendRecording = await track.recorder.stop();

          const sendUrl = sendRecording
            ? URL.createObjectURL(sendRecording)
            : null;
          const sendAudioBuffer = sendUrl
            ? await new Tone.ToneAudioBuffer().load(sendUrl)
            : null;

          const clip = new AudioClip({
            trackId: track.id,
            start,
          });

          if (sendAudioBuffer) {
            audioBufferCache.add(clip.id, sendAudioBuffer.toMono());
            clip.setBuffer(sendAudioBuffer);

            clip.createWaveformCache(sendAudioBuffer);
            track.createAudioClip(clip);
          }
          track.channel.disconnect(track.recorder);
        });

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
    if (this.playDisabled) {
      return;
    }
    Tone.getTransport().start("+0.1");
    this.metronome.start();
    this.mixer.tracks.forEach((track) => track.play());
    if (this.state !== AudioEngineState.recording) {
      this.setState(AudioEngineState.playing);
    }
  };

  pause = async () => {
    this.mixer.tracks.forEach((track) =>
      track.instrument?.releaseAll(Tone.now())
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
      track.instrument?.releaseAll(Tone.now())
    );
    const transport = Tone.getTransport();
    this.metronome.stop();
    transport.stop();
    transport.cancel();
    this.timeline.setSeconds(transport.seconds);
    this.setState(AudioEngineState.stopped);
  };

  async getProjectZip(download = true) {
    const clips = this.mixer.tracks
      .map((track) => track.clips)
      .flat()
      .filter((clip) => clip instanceof AudioClip);
    const mp3Promises = clips.map(async (clip: AudioClip, i) => {
      const buffer = audioBufferCache.get(clip.id);
      if (buffer) {
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

    let totalFileSize = 0;

    const zip = new JSZip();
    mp3Files.forEach((file) => {
      zip.file(file.name, file);
      totalFileSize += file.size;
    });
    zip.file(settingsFile.name, settingsFile);
    totalFileSize += settingsFile.size;

    const metadata = JSON.stringify({
      projectName: this.projectName,
      bpm: this.timeline.bpm,
      timeSignature: this.timeline.timeSignature,
      key: this.key,
      lastModified: new Date().toISOString(),
      size: totalFileSize,
    });

    const zipBlob = await zip.generateAsync({
      type: "blob",
      comment: metadata,
    });
    if (!download) {
      return zipBlob;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${this.projectName}.zip`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  async loadProjectDataFromFile(projectZip?: File) {
    try {
      this.setLoadingState("Loading project");

      if (!projectZip) {
        return new Promise<void>((resolve, reject) => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = ".zip";
          fileInput.style.display = "none";

          document.body.appendChild(fileInput);

          fileInput.onchange = async (event) => {
            try {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (!file) {
                this.setLoadingState(null);
                return resolve();
              }

              const data = await unzipProjectFile(file);
              const settingsBlob = data["settings.json"];

              if (!settingsBlob) {
                throw new Error("No settings data found");
              }

              const settings = (await blobToJsonObject(
                settingsBlob
              )) as unknown as AudioEngine;

              const samplePathsToLoad: string[] = [];

              settings.mixer.tracks.forEach((track) => {
                if (track.instrumentKey === "sampler") {
                  const path = (track.instrument as Sampler).samplePath;
                  if (path) {
                    samplePathsToLoad.push(path);
                  }
                }
              });

              const uniqueSamplePathsToLoad = [...new Set(samplePathsToLoad)];

              try {
                await addInitialSamplesToCache(uniqueSamplePathsToLoad);
              } catch (error) {
                console.error(error);
              }
              await populateBufferCache(data);

              document.body.removeChild(fileInput);

              const loadedTimeline = fromSnapshot(
                settings.timeline
              ) as Timeline;
              const loadedMixer = fromSnapshot(settings.mixer) as Mixer;
              const loadedMetronome = fromSnapshot(
                settings.metronome
              ) as Metronome;
              const loadedKeyboard = fromSnapshot(
                settings.keyboard
              ) as Keyboard;
              const loadedProjectId = fromSnapshot(
                settings.projectId
              ) as string;
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
              this.setKey(settings.key);

              const loadedAuxSendManager = fromSnapshot(
                settings.auxSendManager
              ) as AuxSendManager;

              this.setAuxSendManager(loadedAuxSendManager);

              this.setLoadingState(null);
              resolve();
            } catch (error) {
              this.setLoadingState(null);
              reject(error);
            }
          };

          fileInput.oncancel = () => {
            document.body.removeChild(fileInput);
            this.setLoadingState(null);
            resolve();
          };

          fileInput.click();
        });
      } else {
        return new Promise<void>(async (resolve, reject) => {
          try {
            this.setLoadingState("Extracting project data");
            const data = await unzipProjectFile(projectZip);
            const settingsBlob = data["settings.json"];

            if (!settingsBlob) {
              throw new Error("No settings data found");
            }

            this.setLoadingState("Parsing project settings");
            const settings = (await blobToJsonObject(
              settingsBlob
            )) as unknown as AudioEngine;

            this.setLoadingState("Loading audio samples");
            const samplePathsToLoad: string[] = [];

            settings.mixer.tracks.forEach((track) => {
              if (track.instrumentKey === "sampler") {
                const path = track.sampler.samplePath;
                if (path) {
                  samplePathsToLoad.push(path);
                }
              }
            });

            const uniqueSamplePathsToLoad = [...new Set(samplePathsToLoad)];
            try {
              await addInitialSamplesToCache(uniqueSamplePathsToLoad);
            } catch (error) {
              console.error(error);
            }
            await populateBufferCache(data);

            this.setLoadingState("Reconstructing project state");
            const loadedTimeline = fromSnapshot(settings.timeline) as Timeline;
            const loadedMixer = fromSnapshot(settings.mixer) as Mixer;
            const loadedMetronome = fromSnapshot(
              settings.metronome
            ) as Metronome;
            const loadedKeyboard = fromSnapshot(settings.keyboard) as Keyboard;
            const loadedProjectId = fromSnapshot(settings.projectId) as string;
            const loadedProjectName = fromSnapshot(
              settings.projectName
            ) as string;
            const loadedAuxSendManager = fromSnapshot(
              settings.auxSendManager
            ) as AuxSendManager;

            this.setLoadingState("Generating waveforms");

            const audioClips: AudioClip[] = [];
            loadedMixer.tracks.forEach((track) => {
              track.clips.forEach((clip) => {
                if (clip instanceof AudioClip) {
                  audioClips.push(clip);
                }
              });
            });

            const chunkSize = 5;
            for (let i = 0; i < audioClips.length; i += chunkSize) {
              const chunkClips = audioClips.slice(i, i + chunkSize);

              await Promise.all(
                chunkClips.map(async (clip) => {
                  const buffer = audioBufferCache.get(clip.id);
                  if (buffer) {
                    await clip.createWaveformCache(buffer);
                  } else {
                    console.warn(`No buffer found for clip ${clip.id}`);
                  }
                })
              );

              await new Promise((resolve) => setTimeout(resolve, 0));
            }

            this.setLoadingState("Processing audio buffers");

            this.setLoadingState("Building audio engine");

            await new Promise<void>((resolveUI) => {
              requestAnimationFrame(() => {
                this.setTimeline(loadedTimeline);
                this.setMixer(loadedMixer);
                this.setKeyboard(loadedKeyboard);
                this.setProjectId(loadedProjectId);
                this.setProjectName(loadedProjectName);
                this.setMetronome(loadedMetronome);
                this.setKey(settings.key as string);
                this.setAuxSendManager(loadedAuxSendManager);

                resolveUI();
              });
            });

            this.setLoadingState(null);
            this.mixer.refreshTopPanelHeight();
            resolve();
          } catch (error) {
            console.error("Error loading project:", error);
            this.setLoadingState(null);
            reject(error);
          }
        });
      }
    } catch (error) {
      this.setLoadingState(null);
      throw error;
    }
  }

  async loadProjectDataFromObject(settings: Record<string, unknown>) {
    this.setLoadingState("Loading project");
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
      this.setKey(settings.key as string);

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
          this.setKey(settings.key as string);

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
    this.setLoadingState(null);
  }

  getBounceEndFromLastClip = (sampleRate: number) => {
    const duration = this.mixer.getLastClipEndSamples() / sampleRate;
    return duration;
  };

  resetTone() {
    const transport = Tone.getTransport();
    transport.stop();

    transport.cancel(0);

    transport.position = 0;

    transport.bpm.value = 120;

    transport.timeSignature = [4, 4];
  }
}
