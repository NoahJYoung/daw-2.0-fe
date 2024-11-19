import { AuxSend, Track } from "@/pages/studio/audio-engine/components";

export const isSameTrack = (track1: Track, track2: Track) => {
  return track1.id === track2.id;
};

export const routeAlreadyExists = (
  fromTrack: Track,
  toTrack: Track,
  routes: AuxSend[]
) => {
  const condition = routes.some(
    (route) => route.from.id === fromTrack.id && route.to.id === toTrack.id
  );

  return condition;
};

export const isCircular = (
  fromTrack: Track,
  toTrack: Track,
  auxSends: AuxSend[]
): boolean => {
  const hasCircularReference = (
    currentTrack: Track,
    visitedTracks: Set<Track>
  ): boolean => {
    if (visitedTracks.has(currentTrack) || currentTrack.id === fromTrack.id) {
      return true;
    }

    visitedTracks.add(currentTrack);

    const outgoingRoutes = auxSends.filter(
      (auxSend) => auxSend.from === currentTrack
    );

    for (const route of outgoingRoutes) {
      if (hasCircularReference(route.to, visitedTracks)) {
        return true;
      }
    }

    visitedTracks.delete(currentTrack);
    return false;
  };

  const visitedTracks = new Set<Track>();

  return hasCircularReference(toTrack, visitedTracks);
};

export const isValidSend = (
  fromTrack: Track,
  toTrack: Track,
  routes: AuxSend[]
) => {
  return (
    !isSameTrack(fromTrack, toTrack) &&
    !routeAlreadyExists(fromTrack, toTrack, routes) &&
    !isCircular(fromTrack, toTrack, routes)
  );
};
