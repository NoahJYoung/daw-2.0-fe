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
  ModalProvider,
} from "./components";

export const Studio = observer(() => (
  <AudioEngineProvider>
    <UndoManagerProvider>
      <HotKeysManager />
      <BottomPanelProvider>
        <StudioLayout
          upperPanel={<TopPanel />}
          middlePanel={<MainControls />}
          lowerPanel={<BottomPanel />}
        />
        <ModalProvider />
      </BottomPanelProvider>
    </UndoManagerProvider>
  </AudioEngineProvider>
));
