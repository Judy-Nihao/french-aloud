import { FrenchReader } from "@/components/FrenchReader";

const Home = () => {
  return (
    <main className="reader-canvas min-h-screen bg-canvas px-4 pt-14 pb-6 text-strong md:px-6 md:pt-20 md:pb-12">
      <div className="relative mx-auto max-w-3xl rounded-panel rounded-tr-none border border-border/60 bg-panel p-5 shadow-panel md:p-10">
        <FrenchReader />
      </div>
    </main>
  );
};

export default Home;
