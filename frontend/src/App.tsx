import { Routes, Route } from "react-router";

import { HomePage } from "./pages/HomePage";
import { JobListPage } from "./pages/JobListPage";
import { JobStatusPage } from "./pages/JobStatusPage";
import { JobResultPage } from "./pages/JobResultPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobListPage />} />
      <Route path="/jobs/:jobId" element={<JobStatusPage />} />
      <Route path="/jobs/:jobId/result" element={<JobResultPage />} />
    </Routes>
  );
}
