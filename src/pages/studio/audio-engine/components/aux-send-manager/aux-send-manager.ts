import { model, ExtendedModel, prop, idProp } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { AuxSend } from "../aux-send";
import { Track } from "../track";
import { trackRef } from "../refs";

@model("AudioEngine/AuxSendManager")
export class AuxSendManager extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  sends: prop<AuxSend[]>(() => []).withSetter(),
}) {
  getRefId() {
    return this.id;
  }

  createAuxSend(from: Track, to: Track) {
    const newSend = new AuxSend({
      fromRef: trackRef(from),
      toRef: trackRef(to),
    });

    this.setSends([...this.sends, newSend]);
  }

  removeAuxSend(id: string) {
    const sendToRemove = this.sends.find((send) => send.id === id);
    if (sendToRemove) {
      sendToRemove.disconnect();
      const filteredSends = [...this.sends.filter((send) => send.id !== id)];
      this.setSends(filteredSends);
    }
  }

  getReceivesByTrack(track: Track) {
    return [...this.sends].filter((send) => send.to === track);
  }

  getSendsByTrack(track: Track) {
    return [...this.sends].filter((send) => send.from === track);
  }
}
