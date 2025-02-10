import { ApiTest } from "./components/ApiTest/ApiTest";
import { AppProvider } from "./app/AppProvider";
import "./fonts.css";

function App() {
  return (
    <AppProvider>
      <ApiTest />
    </AppProvider>
  );
}

export default App;
