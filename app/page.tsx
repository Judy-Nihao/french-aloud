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

        <div className="mt-8 space-y-4 text-slate-700">
          <p>
            Use{" "}
            <code className="rounded bg-slate-100 px-2 py-1 text-sm">
              /app/api/tts
            </code>{" "}
            to send text to ElevenLabs, and use the Supabase client in{" "}
            <code className="rounded bg-slate-100 px-2 py-1 text-sm">
              lib/supabase
            </code>
            .
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Store Supabase keys in{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
              .
            </li>
            <li>
              Set{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                ELEVENLABS_API_KEY
              </code>{" "}
              and{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                ELEVENLABS_VOICE_ID
              </code>
              .
            </li>
            <li>
              Tailwind CSS is enabled through{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                postcss.config.mjs
              </code>{" "}
              and{" "}
              <code className="rounded bg-slate-100 px-2 py-1 text-sm">
                app/globals.css
              </code>
              .
            </li>
          </ul>
        </div>

        <TestIntegrationPanel />
      </div>
    </main>
  );
};

export default Home;
