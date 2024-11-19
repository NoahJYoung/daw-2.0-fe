import { Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

import { AuxSends } from "./components";
import { isCircular, isSameTrack, isValidSend } from "./helpers";

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

  const newSendOptions = mixer.tracks.filter((mixerTrack) =>
    isValidSend(track, mixerTrack, auxSendManager.sends)
  );
  const existingSendOptions = mixer.tracks.filter(
    (mixerTrack) =>
      !isSameTrack(track, mixerTrack) &&
      !isCircular(track, mixerTrack, auxSendManager.sends)
  );

  const newReceiveOptions = mixer.tracks.filter((mixerTrack) =>
    isValidSend(mixerTrack, track, auxSendManager.sends)
  );
  const existingReceiveOptions = mixer.tracks.filter(
    (mixerTrack) =>
      !isSameTrack(track, mixerTrack) &&
      !isCircular(mixerTrack, track, auxSendManager.sends)
  );

  return (
    <div className="w-[99%] max-w-[1360px] flex flex-col sm:flex-row justify-evenly gap-2">
      <AuxSends
        title="Aux Receives"
        onCreate={createReceive}
        onDelete={onDelete}
        mode="receive"
        sends={receives}
        existingRouteOptions={existingReceiveOptions}
        newRouteOptions={newReceiveOptions}
      />

      <div className="flex flex-col gap-2 w-full h-full max-h-[275px] p-1 border rounded-sm border-surface-2">
        <h5 className="font-bold text-surface-5">{`${track.name} Track Effects`}</h5>
      </div>

      <AuxSends
        title="Aux Sends"
        onCreate={createSend}
        onDelete={onDelete}
        sends={sends}
        existingRouteOptions={existingSendOptions}
        newRouteOptions={newSendOptions}
      />
    </div>
  );
});
