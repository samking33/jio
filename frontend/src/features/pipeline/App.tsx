import React from "react";
import { PipelineProvider } from "./context/PipelineContext";
import { Dashboard }        from "./pages/Dashboard";

export default function App({ standalone = true }: { standalone?: boolean }) {
  return (
    <PipelineProvider>
      <Dashboard standalone={standalone} />
    </PipelineProvider>
  );
}
