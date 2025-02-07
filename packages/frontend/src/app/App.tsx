import { ApiTest } from "@/components/ApiTest/ApiTest";
import "./App.css";
import { AppProvider } from "./AppProvider";
import { RootLayout } from "@/components/layouts/RootLayout";

function App() {
  return (
    <AppProvider>
      <RootLayout>
        <ApiTest />
      </RootLayout>
    </AppProvider>
  );
}

export default App;
