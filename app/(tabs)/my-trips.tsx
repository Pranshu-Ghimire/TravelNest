import { BackButton } from "@/components/back-button";
import { getTrips } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222222",
    marginTop: 15,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 6,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  tripCard: {
    backgroundColor: "#E5F4F1",
    borderRadius: 16,
    padding: 18,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tripName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    flex: 1,
  },

  tripDestination: {
    fontSize: 15,
    color: "#555555",
    marginTop: 8,
  },

  tripDate: {
    fontSize: 14,
    color: "#777777",
    marginTop: 6,
  },

  tapText: {
    color: "#4B918C",
    marginTop: 12,
    fontWeight: "600",
    fontSize: 14,
  },

  emptyText: {
    textAlign: "center",
    color: "#777777",
    fontSize: 15,
    marginTop: 40,
  },
});

export default function MyTrips() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchTrips = async () => {
        try {
          setLoading(true);
          const data = await getTrips();
          setTrips(data);
        } catch (error) {
          console.log("Error loading trips in MyTrips:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchTrips();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>My Trips ✈️</Text>
        <Text style={styles.subtitle}>View and manage all your travel plans.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4B918C" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No trips found yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {trips.map((trip) => (
            <Pressable
              key={trip.id}
              style={styles.tripCard}
              onPress={() =>
                router.push({
                  pathname: "/trip-details" as any,
                  params: { id: trip.id },
                })
              }
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.tripName}>{trip.tripName}</Text>
                <Ionicons name="chevron-forward" size={20} color="#4B918C" />
              </View>

              <Text style={styles.tripDestination}>📍 {trip.destination}</Text>
              <Text style={styles.tripDate}>📅 {trip.travelDate}</Text>

              <Text style={styles.tapText}>Tap to view details →</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
