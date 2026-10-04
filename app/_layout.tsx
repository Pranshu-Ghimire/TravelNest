import { initializeFirebase } from "@/services/firebase";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

const { auth } = initializeFirebase();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingScreen}>
        <Image
          source={require("@/assets/images/travelnest-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  const isProtected = !!auth.currentUser;

  return (
    <>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={isProtected ? "(home)" : "index"}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />

        <Stack.Protected guard={isProtected}>
          <Stack.Screen name="(home)" />
        </Stack.Protected>
      </Stack>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 240,
    height: 240,
  },
});
