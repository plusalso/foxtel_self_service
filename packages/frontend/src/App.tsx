import "./App.css";
import { AppProvider } from "./app/AppProvider";
import { TemplateGenerator } from "./components/TemplateGenerator";

function App() {
  return (
    <AppProvider>
      <TemplateGenerator />
    </AppProvider>
  );
}

export default App;
