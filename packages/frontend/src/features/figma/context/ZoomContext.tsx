import React, { createContext, useContext, useState } from "react";

type ZoomType = number | "fit";

interface ZoomContextType {
  zoom: ZoomType;
  setZoom: (zoom: ZoomType) => void;
  scaleFactor: number | "fit";
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState<ZoomType>("fit");

  // Calculate the actual scale factor to pass to AssetRenderer
  const scaleFactor = zoom === "fit" ? "fit" : zoom / 100;

  return <ZoomContext.Provider value={{ zoom, setZoom, scaleFactor }}>{children}</ZoomContext.Provider>;
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error("useZoom must be used within a ZoomProvider");
  }
  return context;
}
