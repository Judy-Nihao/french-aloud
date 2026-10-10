import { FrenchReader } from "@/components/FrenchReader";

const Home = () => {
  return (
    <main className="min-h-screen bg-canvas px-4 py-8 text-strong sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-panel border border-border bg-surface/95 p-5 shadow-panel sm:p-8">
        <FrenchReader />
      </div>
    </main>
  );
};

export default Home;
