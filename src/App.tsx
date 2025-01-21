import { Toaster } from "react-hot-toast";
import BarcodeScanner from "./BarcodeScanner";

function App() {
  return (
    <div>
      <Toaster />
      <BarcodeScanner />
    </div>
  );
}

export default App;
