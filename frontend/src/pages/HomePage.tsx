import { useState } from "react";
import { useNavigate } from "react-router";
import { createProcessingJob } from "../api/jobs";

import type { SubmitEvent } from "react";

export function HomePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    if (!instruction.trim()) {
      alert("Please enter an instruction.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("instruction", instruction);

    try {
      const job = await createProcessingJob(file, instruction);

      if (job == null) {
        return;
      }

      navigate(`/jobs/${job.id}`, { replace: true });
    } catch (error) {
      alert(`Failed to create job: ${error}`);
      console.error("Failed to create job", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          NL Regex Processor
        </h1>

        <p className="mt-2 text-slate-600">
          Upload CSV or Excel files and process text patterns.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-slate-700"
            >
              Upload file
            </label>

            <input
              id="file"
              type="file"
              accept=".csv, .xlsx"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
              }}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
            />

            {file && (
              <p className="mt-2 text-sm text-slate-500">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="instruction"
              className="block text-sm font-medium text-slate-700"
            >
              Pattern description
            </label>

            <textarea
              id="instruction"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder={
                "Example: \"Find email addresses in the Email column and replace them with 'REDACTED'.\""
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={!file || !instruction.trim()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Start processing
          </button>
        </form>
      </section>
    </main>
  );
}
