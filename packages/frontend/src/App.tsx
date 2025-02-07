import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import { ApiTest } from "./components/ApiTest/ApiTest";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <ApiTest />
      </Theme>
    </QueryClientProvider>
  );
}

export default App;
