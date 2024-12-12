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
import { useEffect } from "react";
import { useApi } from "@/api";
import { initBufferCache } from "./utils";

export const Studio = observer(() => {
  const api = useApi();

  useEffect(() => {
    const init = async () => {
      await initBufferCache(api);
    };
    init();
  }, [api]);

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
