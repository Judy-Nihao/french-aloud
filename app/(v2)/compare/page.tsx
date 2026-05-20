import Input from "@/components/v2/Input";
import VoiceSwitch from "@/components/v2/VoiceSwitch";

export const metadata = {
  title: "French Aloud — Design Compare",
};

export default function V2Page() {
  return (
    <>
      <VoiceSwitch />
      <Input />
    </>
  );
}
