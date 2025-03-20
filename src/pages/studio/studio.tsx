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
  Loader,
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
        <Loader />
        <ModalProvider />
      </BottomPanelProvider>
    </UndoManagerProvider>
  </AudioEngineProvider>
));
