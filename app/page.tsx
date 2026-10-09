import { FrenchReader } from "@/components/FrenchReader";

const Home = () => {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-8">
        <FrenchReader />
      </div>
    </main>
  );
};

export default Home;
