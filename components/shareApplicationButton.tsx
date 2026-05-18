import { Share } from "react-native";
import { Button } from "react-native-paper";

type Props = {
  roleTitle: string;
  companyName: string;
};

export default function ShareApplicationButton({
  roleTitle,
  companyName,
}: Props) {
  async function handleShare() {
    await Share.share({
      message: `I just applied for the ${roleTitle} position at ${companyName}!`,
    });
  }

  return <Button onPress={handleShare}>Share</Button>;
}