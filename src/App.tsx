import Home from "./routes/Home";
import "./App.css";
import { DlcDevKitProvider } from "./hooks/use-dlcdevkit";

function App() {
  return <DlcDevKitProvider><Home /></DlcDevKitProvider>
}

export default App;
