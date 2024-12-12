import { Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

import { AuxRoutes, EffectsChainView } from "./components";
import { isCircular, isSameTrack, isValidSend } from "./helpers";

interface TrackEffectsViewProps {
  track: Track;
}

export const TrackEffectsView = observer(({ track }: TrackEffectsViewProps) => {
  const { auxSendManager, mixer } = useAudioEngine();

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
      <AuxRoutes
        title={`${track.name} - Aux Receives`}
        onCreate={createReceive}
        onDelete={onDelete}
        mode="receive"
        routes={receives}
        existingRouteOptions={existingReceiveOptions}
        newRouteOptions={newReceiveOptions}
      />

      <EffectsChainView track={track} />

      <AuxRoutes
        title={`${track.name} - Aux Sends`}
        onCreate={createSend}
        onDelete={onDelete}
        routes={sends}
        existingRouteOptions={existingSendOptions}
        newRouteOptions={newSendOptions}
      />
    </div>
  );
});
