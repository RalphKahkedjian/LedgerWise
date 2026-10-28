import QRCode from "react-native-qrcode-svg"
import { useAuth } from "@/context/AuthContext"
import { View, Text } from "react-native"
import { version } from "react";

export default function MyQRCode() {
  const {user} = useAuth();

  if (!user?.id) {
    return <Text> Unable to generate QR code.</Text>
  }

  const qrValue = JSON.stringify({
    type: "ledgerwise-payment",
    version: 1,
    recipientId: user.id,
  });

  return (
    <View>
      <QRCode value={qrValue} size={200} />
    </View>
  )

}