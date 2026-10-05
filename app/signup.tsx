import { Image, StyleSheet, Text, View } from "react-native";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { InputField } from "@/components/input-field";
import { signUp } from "@/services/firebase";
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

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fieldsError, setFieldsError] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleSignUp = async () => {
    try {
      if (!fullName || !email || !password) {
        setFieldsError({
          fullName: !fullName ? "Full name is required" : "",
          email: !email ? "Email is required" : "",
          password: !password ? "Password is required" : "",
        });
        return;
      }

      setFieldsError({
        fullName: "",
        email: "",
        password: "",
      });

      setIsLoading(true);

      await signUp(fullName, email, password);

      router.push("/login");

      Toast.show({
        type: "success",
        text1: "Account created successfully",
      });
    } catch (error: any) {
      console.log("Sign up error:", error);

      Toast.show({
        type: "error",
        text1: "Sign up failed",
        text2:
          error?.message || "Something went wrong. Please try again.",
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
          <Text style={styles.headerTitle}>Create your account</Text>

          <Text style={styles.headerSubtitle}>
            Join TravelNest and start planning your next adventure.
          </Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <InputField
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          error={fieldsError.fullName}
        />

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
          title="Create Account"
          type="primary"
          onPress={handleSignUp}
          disabled={isLoading}
          loading={isLoading}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
          </Text>

          <Link href="/login" style={styles.loginTextLink}>
            Log In
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
