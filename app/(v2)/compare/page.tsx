import Input from "@/components/v2/Input";
import VoiceSwitch from "@/components/v2/VoiceSwitch";

export const metadata = {
  title: "French Aloud — Design Compare",
};

const V2Page = () => {
  return (
    <>
      <VoiceSwitch />
      <Input />
    </>
  );
};

export default V2Page;
