import { AudioEngine } from "../../audio-engine";
import * as Tone from "tone";

export const generateOfflineSends = (engine: AudioEngine) => {
  const { mixer, auxSendManager } = engine;

  auxSendManager.sends.forEach((send) => {
    const offlineSend = new Tone.Channel(send.volume);

    const from = mixer.tracks.find((track) => track.id === send.from?.id);
    const to = mixer.tracks.find((track) => track.id === send.to?.id);

    if (from && to) {
      from.channel.connect(offlineSend);
      offlineSend.connect(to.channel);
    }
  });
};
