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
  fft = new Tone.Analyser("fft", 2048);

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
    this.setBands([...this.bands, band]);
  }

  removeBand(oldBand: Band) {
    if (oldBand.type === "peaking") {
      this.setBands([...this.bands].filter((band) => band.id !== oldBand.id));
    }
  }

  sync() {
    super.sync();
    this.disconnectBands();
    this.chain();
  }

  init() {
    super.init();
    this.sync();
  }

  disconnectBands() {
    this.bands.forEach((band) => band.disconnect());
  }

  chain() {
    this.input.chain(
      ...this.bands.map((band) => band.filter),
      this.output,
      this.outputMeter
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
