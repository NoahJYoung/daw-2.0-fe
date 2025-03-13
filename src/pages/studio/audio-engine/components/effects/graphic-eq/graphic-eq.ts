import { ExtendedModel, model, prop } from "mobx-keystone";
import { Effect } from "../../effect/effect";
import { Band } from "./components";
import * as Tone from "tone";
import { computed } from "mobx";

@model("AudioEngine/Effects/GraphicEQ")
export class GraphicEQ extends ExtendedModel(Effect, {
  bands: prop<Band[]>(() => [
    new Band({ frequency: 20, gain: 0, Q: 1, type: "highpass" }),
    new Band({ frequency: 20000, gain: 0, Q: 1, type: "highshelf" }),
  ]).withSetter(),
  selectedBandId: prop<string | undefined>().withSetter(),
}) {
  fft = new Tone.Analyser({
    type: "fft",
    size: 256,
    smoothing: 0.9,
  });

  get name() {
    return "Graphic EQ";
  }

  @computed
  get selectedBand() {
    return this.bands.find((band) => band.id === this.selectedBandId);
  }

  createBand(
    frequency?: number,
    gain?: number,
    Q?: number,
    type: BiquadFilterType = "peaking"
  ) {
    const band = new Band({ frequency, gain, Q, type });

    const highpass = this.bands[0];
    const highshelf = this.bands[this.bands.length - 1];

    const middleBands = this.bands.slice(1, -1);

    this.setBands([highpass, ...middleBands, band, highshelf]);
    this.setSelectedBandId(band.id);
  }

  removeBand(oldBand: Band) {
    if (oldBand.type === "peaking") {
      this.setBands([...this.bands].filter((band) => band.id !== oldBand.id));
    }
  }

  removeSelectedBand() {
    if (this.selectedBand) {
      const selected = this.selectedBand;
      this.setSelectedBandId(undefined);
      this.removeBand(selected);
    }
    if (this.bands.length) {
      this.setSelectedBandId(this.bands[0].id);
    }
  }

  sync() {
    super.sync();
    this.disconnectBands();
    this.chain();
  }

  init() {
    super.init();
    this.fft.set({ smoothing: 0.95 });
    this.sync();
  }

  disconnectBands() {
    this.bands.forEach((band) => band.disconnect());
  }

  chain() {
    this.input.chain(
      ...this.bands.map((band) => band.filter),
      this.output,
      this.outputMeter,
      this.fft
    );
  }

  connect(): void {
    this.chain();
  }

  disconnect(): void {
    super.disconnect();
    this.disconnectBands();
  }
}
