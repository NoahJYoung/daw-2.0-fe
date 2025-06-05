import { model, ExtendedModel, prop, idProp, modelAction } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { Note } from "tone/build/esm/core/type/NoteUnits";
import { audioBufferCache } from "../audio-buffer-cache";
import { blobToAudioBuffer, unzipProjectFile } from "../../helpers";
import { action, observable } from "mobx";
import { getSamplePacks } from "@/hooks/use-file-system/helpers";

@model("AudioEngine/Sampler")
export class Sampler extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  outputGain: prop(0.03).withSetter(),
  samplePath: prop<string | null>(null),
  imgUrl: prop<string>("").withSetter(),
  attack: prop(0).withSetter(),
  release: prop(0.1).withSetter(),
  curve: prop<"exponential" | "linear">("exponential").withSetter(),
}) {
  output = new Tone.Channel();
  private gain = new Tone.Gain(this.outputGain);
  private sampler: Tone.Sampler = new Tone.Sampler();

  @observable
  loading: boolean = false;

  @action
  setLoading(state: boolean) {
    this.loading = state;
  }

  async init() {
    this.sampler?.chain(this.gain, this.output);
    this.sync();
    await this.loadSamples();
  }

  sync() {
    this.gain.set({ gain: this.outputGain });
    const { curve, attack, release } = this;
    this.sampler.set({ curve, attack, release });
  }

  @modelAction
  setSamplePath(path: string) {
    this.samplePath = path;
    this.loadSamples();
  }

  private loadSamplesFromCache() {
    const notes = [
      "C",
      "Db",
      "D",
      "Eb",
      "E",
      "F",
      "Gb",
      "G",
      "Ab",
      "A",
      "Bb",
      "B",
    ];
    const octaves = [1, 2, 3, 4, 5, 6, 7, 8];

    notes.forEach(async (noteName) => {
      octaves.forEach(async (octaveNumber) => {
        const note = `${noteName}${octaveNumber}` as Note;

        const buffer = audioBufferCache.get(`${this.samplePath}/${note}`);

        if (buffer) {
          this.sampler.add(note, buffer);
        }
      });
    });
  }

  async getCoverImage() {
    console.log("getting cover");
    if (!this.samplePath) return;

    if (this.samplePath?.startsWith("localSamples://")) {
      try {
        console.log("IMG TRY BLOCk");
        const root = await navigator.storage.getDirectory();

        const samplePacksDir = await root.getDirectoryHandle("sample-packs");
        const localSamplesPacks = await getSamplePacks(samplePacksDir);

        const splitPath = this.samplePath.split("//")[1];

        const [packId] = splitPath.split("/");

        const samplePack = localSamplesPacks?.find(
          (pack) => pack.id === packId
        );

        if (samplePack) {
          const unzippedObject = await unzipProjectFile(samplePack.data);

          const blob = unzippedObject["cover.png"];
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            this.setImgUrl(imageUrl);
          }
        } else {
          throw new Error(
            `No Samples found for local pack with id: '${packId}'`
          );
        }
      } catch (error) {
        console.error("Error loading instrument:", error);
      } finally {
        this.setLoading(false);
      }
    } else {
      const instrumentName = this.samplePath.split("/")[3];
      try {
        const response = await fetch(this.samplePath);
        const blob = await response.blob();
        const file = new File([blob], instrumentName + ".zip", {
          type: "application/zip",
        });

        const files = await unzipProjectFile(file);
        const coverBlob = files[`${instrumentName}/cover.png`];
        if (coverBlob) {
          const imageUrl = URL.createObjectURL(coverBlob);
          this.setImgUrl(imageUrl);
        }
      } catch (error) {
        console.error("Error loading cover image:", error);
      }
    }
  }

  async loadSamples() {
    if (!this.samplePath) return;
    this.setLoading(true);

    if (audioBufferCache.loadedSamples.includes(this.samplePath)) {
      this.loadSamplesFromCache();
      await this.getCoverImage();
      this.setLoading(false);
    } else {
      if (this.samplePath?.startsWith("localSamples://")) {
        try {
          const root = await navigator.storage.getDirectory();

          const samplePacksDir = await root.getDirectoryHandle("sample-packs");
          const localSamplesPacks = await getSamplePacks(samplePacksDir);

          const splitPath = this.samplePath.split("//")[1];

          const [packId] = splitPath.split("/");

          const samplePack = localSamplesPacks?.find(
            (pack) => pack.id === packId
          );

          if (samplePack) {
            const unzippedObject = await unzipProjectFile(samplePack.data);

            const samplesMap: Record<string, Tone.ToneAudioBuffer> = {};

            await Promise.all(
              Object.keys(unzippedObject).map(async (key) => {
                if (key !== "cover.png") {
                  const audioBlob = unzippedObject[key];
                  const audioBuffer = await blobToAudioBuffer(audioBlob);
                  samplesMap[key] = audioBuffer;
                } else {
                  const blob = unzippedObject[key];
                  if (blob) {
                    const imageUrl = URL.createObjectURL(blob);
                    this.setImgUrl(imageUrl);
                  }
                }
              })
            );
            audioBufferCache.addSamples({
              path: this.samplePath,
              samples: samplesMap,
            });
            this.loadSamplesFromCache();
          } else {
            this.setSamplePath("");
            throw new Error(
              `No Samples found for local pack with id: '${packId}'`
            );
          }
        } catch (error) {
          console.error("Error loading instrument:", error);
        } finally {
          this.setLoading(false);
        }
      } else {
        const instrumentName = this.samplePath.split("/")[3];
        try {
          const response = await fetch(this.samplePath);
          const blob = await response.blob();
          const file = new File([blob], instrumentName + ".zip", {
            type: "application/zip",
          });

          const files = await unzipProjectFile(file);
          const coverBlob = files[`${instrumentName}/cover.png`];
          if (coverBlob) {
            const imageUrl = URL.createObjectURL(coverBlob);
            this.setImgUrl(imageUrl);
          }

          const audioFiles = Object.keys(files).filter(
            (key) => key.endsWith(".wav") || key.endsWith(".mp3")
          );

          const samplesMap: Record<string, Tone.ToneAudioBuffer> = {};

          const audioProcessingPromises = audioFiles.map(async (fileName) => {
            const audioBlob = files[fileName];
            const audioBuffer = await blobToAudioBuffer(audioBlob);
            const splitPath = fileName.replace(/\.(wav|mp3)$/i, "").split("/");
            if (splitPath.length > 1) {
              const noteName = splitPath[1];
              samplesMap[noteName] = audioBuffer;
            } else {
              samplesMap[fileName] = audioBuffer;
            }
          });

          await Promise.all(audioProcessingPromises);

          audioBufferCache.addSamples({
            path: this.samplePath,
            samples: samplesMap,
          });
          this.loadSamplesFromCache();
        } catch (error) {
          console.error("Error loading instrument:", error);
        } finally {
          this.setLoading(false);
        }
      }
    }
  }

  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    this.sampler?.triggerAttack(note, time, velocity);
  }

  triggerRelease(note: string, time: Tone.Unit.Time) {
    this.sampler?.triggerRelease(note, time);
  }

  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    this.sampler?.triggerAttackRelease(note, duration, time, velocity);
  }

  releaseAll(time: Tone.Unit.Time) {
    this.sampler?.releaseAll(time);
  }

  connect(node: Tone.ToneAudioNode) {
    this.output.connect(node);
  }

  disconnect(node: Tone.ToneAudioNode) {
    this.output.disconnect(node);
  }

  dispose() {
    this.releaseAll(Tone.now());
    if (this.imgUrl && this.imgUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.imgUrl);
    }
    this.sampler.dispose();
    this.gain.dispose();
    this.output.dispose();
    this.loading = false;
  }
}
