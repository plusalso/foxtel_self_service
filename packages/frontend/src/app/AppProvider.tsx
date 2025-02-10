import "@radix-ui/themes/styles.css";
import React from "react";
import { Theme } from "@radix-ui/themes";
import { theme } from "../config/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TemplateProvider } from "@/features/figma/context/TemplateContext";
import "./theme.css";
const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TemplateProvider>
        <Theme {...theme}>
          {children}
          {/* <QueryProvider>{children}</QueryProvider> */}
        </Theme>
      </TemplateProvider>
    </QueryClientProvider>
  );
}
