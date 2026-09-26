import { NamedVoiceReader } from "@/components/NamedVoiceReader";

const ReaderPage = () => {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-900 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-stone-300 pb-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
            French listening practice
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            French Aloud
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Write a French phrase, choose a voice, and listen at your own pace.
          </p>
        </header>

        <NamedVoiceReader />
      </div>
    </main>
  );
};

export default ReaderPage;
