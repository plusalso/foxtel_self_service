import "./App.css";
import { AppProvider } from "./AppProvider";
import { RootLayout } from "@/components/layouts/RootLayout";

function App() {
  return (
    <AppProvider>
      <RootLayout>
        <p />
      </RootLayout>
    </AppProvider>
  );
}

export default App;
