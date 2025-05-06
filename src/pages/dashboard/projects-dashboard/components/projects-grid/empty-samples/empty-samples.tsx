import { Link } from "@tanstack/react-router";
import { AudioLines } from "lucide-react";

export const EmptySamples = () => {
  return (
    <div className="landscape:gap-2 md:landscape:gap-1 mx-3 flex h-full lg:h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-2 lg:p-8 text-center animate-in fade-in-50">
      <div className="landscape:hidden lg:landscape:flex mx-auto flex w-20 h-20 items-center justify-center rounded-full bg-muted">
        <AudioLines className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">No sample packs found</h2>
      <p className="mb-8 mt-2 text-center text-sm text-muted-foreground max-w-sm mx-auto">
        You haven't created any sample packs yet. Start creating or import an
        existing sample pack.
      </p>
      <div className="gap-2 flex flex-col sm:flex-row">
        <button
          onClick={() => alert("not implemented yet")}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Import Existing Sample Pack
        </button>
        <button className="bg-brand-1 hover:bg-brand-2 text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2">
          <Link to="new">Create New Sample Pack</Link>
        </button>
      </div>
    </div>
  );
};
