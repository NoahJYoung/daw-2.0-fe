import { observer } from "mobx-react-lite";
import { AudioEngineProvider, UndoManagerProvider } from "./hooks";
import {
  BottomPanel,
  HotKeysManager,
  StudioLayout,
  TopPanel,
  MainControls,
} from "./components";

export const Studio = observer(() => {
  return (
    <AudioEngineProvider>
      <UndoManagerProvider>
        <HotKeysManager />
        <StudioLayout
          upperPanel={<TopPanel />}
          middlePanel={<MainControls />}
          lowerPanel={<BottomPanel />}
        />
      </UndoManagerProvider>
    </AudioEngineProvider>
  );
});
