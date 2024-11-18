import { Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

import { AuxSends } from "./components";

interface TrackEffectsViewProps {
  track: Track;
}

export const TrackEffectsView = observer(({ track }: TrackEffectsViewProps) => {
  const { mixer } = useAudioEngine();
  const { auxSendManager } = mixer;

  const sends = auxSendManager.getSendsByTrack(track);
  const receives = auxSendManager.getReceivesByTrack(track);

  const createSend = (selectedSend: Track) => {
    auxSendManager.createAuxSend(track, selectedSend);
  };

  const createReceive = (selectedSend: Track) => {
    auxSendManager.createAuxSend(selectedSend, track);
  };

  const onDelete = (id: string) => {
    auxSendManager.removeAuxSend(id);
  };

  const sendOptions = mixer.tracks.filter(
    (mixerTrack) =>
      mixerTrack.id !== track.id &&
      !receives.some(
        (receive) =>
          receive.from?.id !== track.id && receive.to?.id !== track.id
      )
  );

  const receiveOptions = mixer.tracks.filter(
    (mixerTrack) => mixerTrack.id !== track.id
  );

  return (
    <div className="w-[99%] max-w-[1360px] flex flex-col sm:flex-row justify-evenly gap-2">
      <div className="flex flex-col gap-2 w-full h-full max-h-[275px] p-1 border rounded-sm border-surface-2">
        <h5 className="font-bold text-surface-5">{`${track.name} Track Effects`}</h5>
      </div>

      <AuxSends
        title="Aux Receives"
        onCreate={createReceive}
        onDelete={onDelete}
        sends={receives}
        options={sendOptions}
      />

      <AuxSends
        title="Aux Sends"
        onCreate={createSend}
        onDelete={onDelete}
        sends={sends}
        options={receiveOptions}
      />
    </div>
  );
});
