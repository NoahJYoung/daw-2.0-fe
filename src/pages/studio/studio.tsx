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
import { InstallPrompt } from "@/components/ui/custom/install-prompt";

export const Studio = observer(() => (
  <InstallPrompt>
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
  </InstallPrompt>
));
