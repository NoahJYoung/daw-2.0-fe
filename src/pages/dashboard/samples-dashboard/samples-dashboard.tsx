import { useFileSystem } from "@/hooks";
import { SamplesGrid } from "./components";

export const SamplesDashboard = () => {
  const { quota } = useFileSystem();
  return (
    <section className="flex flex-col bg-muted/40 h-full lg:pt-16">
      <div className="pt-3 px-3 pb-0">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex w-full items-center justify-between mb-2 lg:px-3">
            <span className="flex flex-col justify-center gap-1">
              <h1 className="text-3xl font-bold">Samples</h1>
              <span className="flex gap-1 text-surface-6 text-xs lg:text-sm">
                <p className="hidden sm:block">Used:</p>{" "}
                <strong>{`${quota?.used} `}</strong>/
                <strong>{` ${quota?.total}`}</strong>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <div className="mx-auto max-w-7xl w-full h-full py-2">
          <SamplesGrid />
        </div>
      </div>
    </section>
  );
};
