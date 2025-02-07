import { Box } from "@radix-ui/themes";
import styles from "./Sidebar.module.css";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <Box width="240px" px="4" py="4" className={styles.sidebar}>
      {children}
    </Box>
  );
}
