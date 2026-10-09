import { FrenchReader } from "@/components/FrenchReader";

const Home = () => {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          French Aloud
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          Type a French phrase, choose a voice, and hear it read aloud.
        </p>
        <FrenchReader />
      </div>
    </main>
  );
};

export default Home;
