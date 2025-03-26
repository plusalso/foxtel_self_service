import { Box } from "@radix-ui/themes";
import styles from "./Sidebar.module.css";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <Box width="360px" className={styles.sidebar} style={{ overflowY: "clip", height: "100%" }}>
      {children}
    </Box>
  );
}
