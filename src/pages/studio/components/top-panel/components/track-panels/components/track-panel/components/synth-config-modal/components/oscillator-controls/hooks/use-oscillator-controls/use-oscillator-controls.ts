import { Oscillator } from "@/pages/studio/audio-engine/components";
import { useDeferredUpdate } from "@/pages/studio/hooks";

export const useOscillatorControls = (oscillator: Oscillator) => {
  const { onValueChange: onAttackChange, onValueCommit: commitAttackChange } =
    useDeferredUpdate<number>(oscillator.attack, (value) =>
      oscillator.setAttack(value)
    );
  const resetAttack = () => oscillator.setAttack(0);

  const { onValueChange: onReleaseChange, onValueCommit: commitReleaseChange } =
    useDeferredUpdate<number>(oscillator.release, (value) =>
      oscillator.setRelease(value)
    );
  const resetRelease = () => oscillator.setDecay(0);

  const { onValueChange: onDecayChange, onValueCommit: commitDecayChange } =
    useDeferredUpdate<number>(oscillator.decay, (value) =>
      oscillator.setDecay(value)
    );
  const resetDecay = () => oscillator.setDecay(0);

  const { onValueChange: onSustainChange, onValueCommit: commitSustainChange } =
    useDeferredUpdate<number>(oscillator.sustain, (value) =>
      oscillator.setSustain(value)
    );
  const resetSustain = () => oscillator.setSustain(0);

  return {
    onAttackChange,
    commitAttackChange,
    resetAttack,

    onReleaseChange,
    commitReleaseChange,
    resetRelease,

    onDecayChange,
    commitDecayChange,
    resetDecay,

    onSustainChange,
    commitSustainChange,
    resetSustain,
  };
};
