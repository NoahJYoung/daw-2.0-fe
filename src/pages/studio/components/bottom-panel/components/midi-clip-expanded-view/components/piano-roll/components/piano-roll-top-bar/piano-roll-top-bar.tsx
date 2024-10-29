interface PianoRollTopBarProps {
  width: number;
}

export const PianoRollTopBar = ({ width }: PianoRollTopBarProps) => {
  return (
    <div
      style={{ width }}
      className="h-[20px] max-h-full flex sticky top-0 bg-surface-4 select-none flex-shrink-0"
    />
  );
};
