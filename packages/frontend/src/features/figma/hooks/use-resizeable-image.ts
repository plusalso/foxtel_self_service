// hooks/useResizableImage.ts
import { useState, useEffect } from "react";
import { ResizableImageDefaults } from "../types/template";

interface ResizableImageSize {
  width: string;
  height: string;
}

interface ResizableImagePosition {
  x: number;
  y: number;
}

export function useResizableImage(imageUrl: string, defaults?: ResizableImageDefaults) {
  const [position, setPosition] = useState<ResizableImagePosition>(
    defaults ? { x: defaults.x, y: defaults.y } : { x: 0, y: 0 }
  );

  const [size, setSize] = useState<ResizableImageSize>(
    defaults
      ? {
          width: defaults.width || "auto",
          height: defaults.height || "auto",
        }
      : { width: "200px", height: "200px" }
  );

  const [initialRender, setInitialRender] = useState(true);

  // Calculate the missing dimension while preserving aspect ratio
  const calculateMissingDimension = (
    naturalWidth: number,
    naturalHeight: number,
    providedWidth?: string | number,
    providedHeight?: string | number
  ): { width: string; height: string } => {
    const naturalRatio = naturalWidth / naturalHeight;

    // Convert dimensions to standardized values (number or "auto")
    const parseSize = (size: string | number | undefined): string | number => {
      if (size === undefined || size === "auto") return "auto";

      // If it's already a number, return it
      if (typeof size === "number") return size;

      // If it's a string with "px", strip it and convert to number
      if (typeof size === "string") {
        const match = size.match(/^(\d+(?:\.\d+)?)(?:px)?$/);
        if (match) return parseFloat(match[1]);
      }

      // Default to "auto" if we can't parse
      return "auto";
    };

    // Parse the provided dimensions
    let width = parseSize(providedWidth);
    let height = parseSize(providedHeight);

    // Calculate the missing dimension
    if (width === "auto" && typeof height === "number") {
      width = Math.round(height * naturalRatio);
    } else if (height === "auto" && typeof width === "number") {
      height = Math.round(Number(width) / naturalRatio);
    }

    // Convert back to string format with "px" for CSS
    const formatSize = (size: string | number): string => {
      if (size === "auto") return "300px"; // Default fallback
      return `${size}px`;
    };

    return {
      width: formatSize(width),
      height: formatSize(height),
    };
  };

  // Initialize dimensions based on image and defaults
  useEffect(() => {
    if (defaults && imageUrl && initialRender) {
      const img = new Image();
      img.onload = () => {
        const defaultWidth = defaults?.width?.replace("px", "") ?? "auto";
        const defaultHeight = defaults?.height?.replace("px", "") ?? "auto";
        const { width, height } = calculateMissingDimension(
          img.naturalWidth,
          img.naturalHeight,
          defaultWidth,
          defaultHeight
        );

        setSize({
          width: width,
          height: height,
        });

        setInitialRender(false);
      };
      img.src = imageUrl;
    }
  }, [defaults, imageUrl, initialRender]);

  // Handle drag operations
  const handleDrag = (_e: any, d: { x: number; y: number }) => {
    setPosition({ x: d.x, y: d.y });
  };

  // Handle resize operations
  const handleResize = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    newPosition: { x: number; y: number }
  ) => {
    setSize({
      width: ref.style.width,
      height: ref.style.height,
    });
    setPosition(newPosition);
  };

  // Get safe size values for Rnd (never "auto")
  const getRndSize = () => ({
    width: size.width === "auto" ? 300 : size.width,
    height: size.height === "auto" ? 200 : size.height,
  });

  return {
    position,
    size,
    getRndSize,
    handleDrag,
    handleResize,
    setPosition,
    setSize,
  };
}
