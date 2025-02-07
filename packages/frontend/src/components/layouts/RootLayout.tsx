import { Header } from "@/components/layouts/Header";
import { Sidebar } from "@/components/layouts/Sidebar";

import styles from "./RootLayout.module.css";
import { Workspace } from "@/components/layouts/Workspace";
import { TemplateGenerator } from "@/components/TemplateGenerator/TemplateGenerator";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar>
          <TemplateGenerator />
        </Sidebar>
        <div className={styles.workspace}>
          <Workspace>{children}</Workspace>
        </div>
      </div>
    </div>
  );
}
