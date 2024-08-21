import { observer } from "mobx-react-lite";
import { AudioEngineProvider, UndoManagerProvider } from "./hooks";
import { TestComponent } from "./components/test-components/test-component";
import { HotKeysManager } from "./components";

export const Studio = observer(() => {
  return (
    <AudioEngineProvider>
      <UndoManagerProvider>
        <HotKeysManager />
        <TestComponent />
      </UndoManagerProvider>
    </AudioEngineProvider>
  );
});
