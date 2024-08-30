import { observer } from "mobx-react-lite";
import { AudioEngineProvider, UndoManagerProvider } from "./hooks";
import {
  BottomPanel,
  HotKeysManager,
  StudioLayout,
  TopPanel,
} from "./components";

export const Studio = observer(() => {
  return (
    <AudioEngineProvider>
      <UndoManagerProvider>
        <HotKeysManager />
        <StudioLayout
          upperPanel={<TopPanel />}
          middlePanel={<div>TRANSPORT</div>}
          lowerPanel={<BottomPanel />}
        />
      </UndoManagerProvider>
    </AudioEngineProvider>
  );
});
