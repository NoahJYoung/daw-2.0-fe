import { useState, useEffect } from "react";

export function useDeferredUpdate<T = number>(
  externalValue: T,
  onCommit: (value: T) => void,
  deps: unknown[] = []
) {
  const [localValue, setLocalValue] = useState<T>(externalValue);

  const onValueCommit = () => {
    onCommit(localValue);
  };

  const onValueChange = (newValue: T) => {
    setLocalValue(newValue);
  };

  useEffect(() => {
    setLocalValue(externalValue);
  }, deps);

  return {
    localValue,
    onValueChange,
    onValueCommit,
  };
}
