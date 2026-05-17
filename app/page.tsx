import { TestIntegrationPanel } from "./test-integration-panel";

export const revalidate = 0;

const Home = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          French Aloud
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          A minimal starter for Supabase + ElevenLabs Text-to-Speech
          integration.
        </p>
        <TestIntegrationPanel />
      </div>
    </main>
  );
};

export default Home;
