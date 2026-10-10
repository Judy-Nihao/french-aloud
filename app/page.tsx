import { FrenchReader } from "@/components/FrenchReader";

const Home = () => {
  return (
    <main className="min-h-screen bg-canvas px-4 pt-14 pb-6 text-strong sm:px-6 sm:pt-20 sm:pb-12">
      <div className="relative mx-auto max-w-3xl rounded-panel border border-border bg-surface p-5 shadow-panel sm:p-10">
        <FrenchReader />
      </div>
    </main>
  );
};

export default Home;
