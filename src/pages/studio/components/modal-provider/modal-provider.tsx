import { observer } from "mobx-react-lite";
import { useAudioEngine } from "../../hooks";
import { EffectDialog } from "../bottom-panel/components/track-effects-view/components/effects-chain-view/components";

export const ModalProvider = observer(() => {
  const { mixer } = useAudioEngine();

  return mixer.tracks.map((track) =>
    track.effectsChain.effects.map((effect) => (
      <EffectDialog
        open={effect.dialogOpen}
        renderTrigger={false}
        key={effect.id}
        track={track}
        effect={effect}
      />
    ))
  );
});
