import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    alignSelf: "flex-start",
  },
});

export function BackButton({
  type = "dark",
  onPress,
  fallbackRoute,
}: {
  type?: "light" | "dark";
  onPress?: () => void;
  fallbackRoute?: string;
}) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (fallbackRoute) {
      router.replace(fallbackRoute as any);
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons
        name="chevron-back"
        size={24}
        color={type === "dark" ? "black" : "white"}
      />
    </TouchableOpacity>
  );
}