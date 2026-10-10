import { FrenchReader } from "@/components/FrenchReader";

const Home = () => {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-strong sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl rounded-panel bg-surface p-5 shadow-panel sm:p-10">
        <FrenchReader />
      </div>
    </main>
  );
};

export default Home;
