import { ExtendedModel, model, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Effect } from "../effect";
import { effectKeyToClassMap } from "../effects";
import * as Tone from "tone";

@model("AudioEngine/EffectsChain")
export class EffectsChain extends ExtendedModel(BaseAudioNodeWrapper, {
  mute: prop(false).withSetter(),
  effects: prop<Effect[]>(() => []).withSetter(),
}) {
  input = new Tone.Channel();
  output = new Tone.Channel();

  private isInputConnectedToOutput = false;
  private previousLastEffect: Effect | null = null;

  sync() {
    this.disconnectRoutes();
    this.connectRoutes();
  }

  init() {
    this.sync();
  }

  connectRoutes() {
    if (this.effects.length) {
      this.input.connect(this.effects[0].input);
      this.input.connect(this.effects[0].bypass);

      this.effects.forEach((effect, i) => {
        effect.connect();
        if (i < this.effects.length - 1) {
          const nextEffect = this.effects[i + 1];
          effect.output.connect(nextEffect.input);
          effect.output.connect(nextEffect.bypass);
        } else {
          effect.output.connect(this.output);
          effect.bypass.connect(this.output);
          this.previousLastEffect = effect;
        }
      });
    } else {
      this.input.connect(this.output);
      this.isInputConnectedToOutput = true;
    }
  }

  disconnectRoutes() {
    if (this.previousLastEffect) {
      this.previousLastEffect.output.disconnect();
    }
    if (this.isInputConnectedToOutput) {
      this.input.disconnect(this.output);
      this.isInputConnectedToOutput = false;
    }
    this.effects.forEach((effect) => effect.disconnect());
  }

  addNewEffectFromKey(key: string) {
    if (key in effectKeyToClassMap) {
      const newEffect = new effectKeyToClassMap[
        key as keyof typeof effectKeyToClassMap
      ]({});
      this.setEffects([...this.effects, newEffect]);
    }
  }

  removeEffect(effectId: string) {
    this.setEffects(
      [...this.effects].filter((effect) => effect.id !== effectId)
    );
  }

  dispose() {
    this.disconnectRoutes();
    this.effects.forEach((effect) => effect.dispose());
    this.effects = [];
    this.input.dispose();
    this.output.dispose();

    this.isInputConnectedToOutput = false;
    this.previousLastEffect = null;
  }
}
