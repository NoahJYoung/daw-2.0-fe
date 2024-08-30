interface KnobProps {
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
  size: number;
  step: number;
}

export const Knob = ({ value, onChange, min, max, step, size }: KnobProps) => {
  return (
    <div style={{ width: size, height: size }}>
      <svg>
        {/* <circle width={size} height={size} fill="black" /> */}
        <circle cx={size} cy={size} r={size} />
        <circle cx={size * 0.2} cy={size} r={size * 0.2} fill="blue" />
      </svg>
    </div>
  );
};
