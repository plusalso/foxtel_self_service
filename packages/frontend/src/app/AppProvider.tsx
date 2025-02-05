import "@radix-ui/themes/styles.css";
import React from "react";
import { Theme } from "@radix-ui/themes";
import { theme } from "../config/theme";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Theme {...theme}>
      {children}
      {/* <QueryProvider>{children}</QueryProvider> */}
    </Theme>
  );
}
