import { useState, useEffect } from "react";
import { useUndoManager } from "../use-undo-manager";

export function useDeferredUpdate<T = number>(
  value: T,
  onCommit: (value: T) => void
) {
  const { undoManager } = useUndoManager();
  const [initialValue, setInitialValue] = useState(value);

  const onValueCommit = (newValue: T) => {
    undoManager.withoutUndo(() => onCommit(initialValue));

    setInitialValue(newValue);
  };

  const onValueChange = (newValue: T) => {
    undoManager.withoutUndo(() => {
      onCommit(newValue);
    });
  };

  useEffect(() => {
    onCommit(initialValue);
  }, [initialValue]);

  return {
    onValueChange,
    onValueCommit,
  };
}
