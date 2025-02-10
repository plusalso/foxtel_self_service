import { Box } from "@radix-ui/themes";
import styles from "./Sidebar.module.css";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <Box width="360px" px="6" py="6" className={styles.sidebar}>
      {children}
    </Box>
  );
}
