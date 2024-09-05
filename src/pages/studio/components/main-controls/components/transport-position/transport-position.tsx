interface TransportPositionProps {
  position: string;
}

export const TransportPosition = ({ position }: TransportPositionProps) => (
  <span className="bg-transparent text-surface-4 text-2xl">{position}</span>
);
