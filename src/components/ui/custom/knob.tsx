interface KnobProps {
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
  size: number;
  step: number;
}

export const Knob = ({ value, onChange, min, max, step, size }: KnobProps) => {
  const initialRotation = 135;
  // Define the rotation range
  const minRotation = -135;
  const maxRotation = 135;

  // Calculate the rotation based on the value
  const rotation =
    minRotation +
    ((value - min) / (max - min)) * (maxRotation - minRotation) +
    initialRotation;
  return (
    <svg
      width={size}
      height={size}
      style={{
        transform: `rotate(${rotation}deg)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <circle
        cx={size - size / 2}
        cy={size - size / 2}
        r={size / 2}
        fill="#333"
      />
      <circle cx={size * 0.1 + 3} cy={size * 0.75} r={size * 0.1} fill="#999" />
    </svg>
  );
};
