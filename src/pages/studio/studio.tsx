import { observer } from "mobx-react-lite";
import {
  AudioEngineProvider,
  BottomPanelProvider,
  UndoManagerProvider,
} from "./hooks";
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
        <BottomPanelProvider>
          <StudioLayout
            upperPanel={<TopPanel />}
            middlePanel={<MainControls />}
            lowerPanel={<BottomPanel />}
          />
        </BottomPanelProvider>
      </UndoManagerProvider>
    </AudioEngineProvider>
  );
});
