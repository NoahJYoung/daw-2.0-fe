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
import { Block } from "@tanstack/react-router";

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
        <Block
          shouldBlockFn={({ current, next }) => {
            const isSaving =
              current.pathname === next.pathname &&
              current.search !== next.search;
            if (isSaving) return false;
            const shouldLeave = confirm(
              "Are you sure you want to leave? You will lose any unsaved changes"
            );
            return !shouldLeave;
          }}
        />
      </UndoManagerProvider>
    </AudioEngineProvider>
  </OrientationManager>
));
