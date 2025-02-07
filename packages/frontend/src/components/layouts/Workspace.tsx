import { Box } from "@radix-ui/themes";

export function Workspace({ children }: { children: React.ReactNode }) {
  return <Box p="6">{children}</Box>;
}
