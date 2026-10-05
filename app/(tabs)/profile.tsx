import Background from "@/assets/svg/homehead.svg";
import { BackButton } from "@/components/back-button";
import { TripSelectModal } from "@/components/trip-select-modal";
import { auth, getNotes, getPackingItems, getTrips, signOut } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  menucontainer: {
    flex: 1,
    marginTop: 24,
    backgroundColor: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    marginHorizontal: 20,
    marginBottom: 10,
  },

  menuCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6F0EE",
    overflow: "hidden",
  },

  itemDivider: {
    height: 1,
    backgroundColor: "#EEF4F2",
    marginLeft: 80,
  },

  header: {
    height: 250,
    overflow: "hidden",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  headerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  profile: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    position: "absolute",
    top: 68,
  },

  pname: {
    color: "#222222",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 35,
    alignSelf: "center",
  },

  username: {
    color: "#777777",
    textAlign: "center",
    marginTop: 5,
  },

  logo: {
    position: "absolute",
    width: 110,
    height: 110,
    top: 180,
    alignSelf: "center",
    borderRadius: 55,
  },

  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#F8FBFA",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  statItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4B918C",
  },

  statLabel: {
    fontSize: 13,
    color: "#777777",
    marginTop: 5,
    fontWeight: "500",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E5F4F1",
    justifyContent: "center",
    alignItems: "center",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 64,
  },

  profile_text: {
    paddingLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: "#222222",
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F4",
    alignItems: "center",
  },

  logoutText: {
    color: "#D9534F",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function Profile() {
  const router = useRouter();

  const user = auth.currentUser;

  const name = user?.displayName || "TravelNest User";
  const email = user?.email || "No email available";
  const [tripCount, setTripCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [packedCount, setPackedCount] = useState(0);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [tripSelectType, setTripSelectType] = useState<
    "packing" | "notes" | "itinerary" | null
  >(null);
  // Load profile statistics whenever Profile screen is opened
  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const trips = await getTrips();
          setUserTrips(trips);
          setTripCount(trips.length);

          let totalNotes = 0;
          let totalPacked = 0;

          for (const trip of trips) {
            const notes = await getNotes(trip.id);
            const packingItems = await getPackingItems(trip.id);

            totalNotes += notes.length;

            totalPacked += packingItems.filter(
              (item: any) => item.checked === true
            ).length;
          }

          setNoteCount(totalNotes);
          setPackedCount(totalPacked);
        } catch (error) {
          console.log("Error loading profile stats:", error);
        }
      };

      loadStats();
    }, [])
  );
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/login");
            } catch (error: any) {
              console.log("Logout error:", error);

              Alert.alert(
                "Error",
                error?.message || "Failed to log out."
              );
            }
          },
        },
      ]
    );
  };

  const handleSelectTrip = (tripId: string) => {
    if (tripSelectType === "packing") {
      router.push({
        pathname: "/packing-list" as any,
        params: { id: tripId },
      });
    } else if (tripSelectType === "notes") {
      router.push({
        pathname: "/notes" as any,
        params: { id: tripId },
      });
    } else if (tripSelectType === "itinerary") {
      router.push({
        pathname: "/itinerary" as any,
        params: { id: tripId },
      });
    }

    setTripSelectType(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Background style={styles.background} />

        <SafeAreaView>
          <BackButton />

          <View style={styles.headerContent}>
            <Text style={styles.profile}>Profile</Text>
          </View>
        </SafeAreaView>
      </View>

      <Image
        source={require("@/assets/images/Profile.png")}
        style={styles.logo}
      />

      <Text style={styles.pname}>{name}</Text>
      <Text style={styles.username}>{email}</Text>

      {/* Profile Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tripCount}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{noteCount}</Text>
          <Text style={styles.statLabel}>Notes</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{packedCount}</Text>
          <Text style={styles.statLabel}>Packed</Text>
        </View>
      </View>

      <View style={styles.menucontainer}>
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/(tabs)/my-trips" as any)}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="airplane-outline"
                size={21}
                color="#4B918C"
              />
            </View>
            <Text style={styles.profile_text}>My Trips</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAAAAA"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => setTripSelectType("packing")}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="bag-suitcase-outline"
                size={21}
                color="#4B918C"
              />
            </View>
            <Text style={styles.profile_text}>Packing Lists</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAAAAA"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => setTripSelectType("notes")}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="document-text-outline"
                size={21}
                color="#4B918C"
              />
            </View>

            <Text style={styles.profile_text}>Notes</Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAAAAA"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => setTripSelectType("itinerary")}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color="#4B918C"
              />
            </View>

            <Text style={styles.profile_text}>Itinerary</Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAAAAA"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <TripSelectModal
        visible={tripSelectType !== null}
        title="Choose a Trip"
        subtitle={
          tripSelectType === "packing"
            ? "Select a trip to view its packing list"
            : tripSelectType === "notes"
              ? "Select a trip to view its notes"
              : "Select a trip to view its itinerary"
        }
        trips={userTrips}
        onSelectTrip={handleSelectTrip}
        onClose={() => setTripSelectType(null)}
      />
    </ScrollView>
  );
}