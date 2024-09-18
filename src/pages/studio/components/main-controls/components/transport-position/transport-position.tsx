interface TransportPositionProps {
  position: string;
}

export const TransportPosition = ({ position }: TransportPositionProps) => (
  <span className="bg-transparent w-full justify-center text-surface-4 mt-1 text-2xl">
    {position}
  </span>
);
