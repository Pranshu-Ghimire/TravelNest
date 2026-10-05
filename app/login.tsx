import { Image, StyleSheet, Text, View } from "react-native";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { InputField } from "@/components/input-field";
import { signIn } from "@/services/firebase";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFA",
  },

  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  safeArea: {
    flex: 1,
  },

  topSection: {
    paddingHorizontal: 20,
  },

  logoImage: {
    width: 190,
    height: 100,
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 18,
  },

  headerContainer: {
    paddingHorizontal: 4,
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: "700",
    color: "#222222",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 8,
    lineHeight: 21,
  },

  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },

  loginContainer: {
    alignItems: "center",
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "center",
  },

  loginText: {
    color: "#555555",
    fontSize: 15,
  },

  loginTextLink: {
    color: "#4B918C",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fieldsError, setFieldsError] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        setFieldsError({
          email: !email ? "Email is required" : "",
          password: !password ? "Password is required" : "",
        });
        return;
      }

      setFieldsError({
        email: "",
        password: "",
      });

      setIsLoading(true);

      const user = await signIn(email, password);

      console.log("user", user);

      router.push("/(tabs)/homepage");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Invalid email or password!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        <BackButton />

        <Image
          source={require("@/assets/images/travelnest-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Welcome back</Text>

          <Text style={styles.headerSubtitle}>
            Sign in to your account to continue your journey.
          </Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <InputField
          label="Email"
          autoCapitalize="none"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={fieldsError.email}
        />

        <InputField
          label="Password"
          autoCapitalize="none"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={fieldsError.password}
        />

        <Button
          title="Sign In"
          type="primary"
          onPress={handleSignIn}
          disabled={isLoading}
          loading={isLoading}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Don't have an account?{" "}
          </Text>

          <Link href="/signup" style={styles.loginTextLink}>
            Sign Up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
