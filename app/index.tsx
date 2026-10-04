import { Button } from "@/components/button";
import { auth } from "@/services/firebase";
import { Link, Redirect, useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFA",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logo: {
    width: 230,
    height: 150,
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 23,
  },

  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 4,
  },

  loginText: {
    fontSize: 15,
    color: "#444444",
  },

  loginTextLink: {
    fontSize: 15,
    color: "#4B918C",
    fontWeight: "600",
  },
});

export default function Index() {
  const router = useRouter();

  if (auth.currentUser) {
    return <Redirect href="/(tabs)/homepage" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/travelnest-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Your next adventure{"\n"}starts here
        </Text>

        <Text style={styles.subtitle}>
          Plan your trips, organize your journey,{"\n"}
          and keep every adventure in one place.
        </Text>
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.actionContainer}>
        <Button
          title="Get Started"
          type="primary"
          onPress={() => router.push("/signup")}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>

          <Link href="/login" style={styles.loginTextLink}>
            Log In
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
}
