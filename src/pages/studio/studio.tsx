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
import {
  Block,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";

export const Studio = observer(() => {
  const { projectId } = useParams({ strict: false });
  const navigate = useNavigate();
  const tempProjectId = useSearch({
    from: projectId
      ? "/app/projects/studio/$projectId"
      : "/app/projects/studio",
    select: (search) => search.tempProjectId,
  });

  useEffect(() => {
    if (tempProjectId) {
      navigate({ to: `/app/projects/studio/${tempProjectId}` });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
              const isNavigatingAfterRefresh =
                current.search.tempProjectId === next.params.projectId;

              if (isSaving || isNavigatingAfterRefresh) return false;
              const shouldLeave = confirm(
                "Are you sure you want to leave? You will lose any unsaved changes"
              );
              return !shouldLeave;
            }}
          />
        </UndoManagerProvider>
      </AudioEngineProvider>
    </OrientationManager>
  );
});
