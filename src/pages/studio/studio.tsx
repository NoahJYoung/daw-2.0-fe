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
import { OrientationManager } from "@/components/ui/custom/orientation-manager";
import { isMobileDevice } from "./utils";

export const Studio = observer(() => (
  <OrientationManager requireLandscape={isMobileDevice()}>
    <AudioEngineProvider>
      <UndoManagerProvider>
        <BottomPanelProvider>
          <HotKeysManager />
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
  </OrientationManager>
));
