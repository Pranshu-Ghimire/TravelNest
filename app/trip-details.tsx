import { BackButton } from "@/components/back-button";
import { deleteTrip, getTripById } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function parseTripDates(travelDateStr?: string) {
  if (!travelDateStr) {
    return { startDate: "N/A", endDate: "N/A", totalDays: "N/A" };
  }

  const parts = travelDateStr.trim().split(/\s+(?:-|–|—|to)\s+/i);

  const formatFriendly = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (parts.length >= 2) {
    const start = new Date(parts[0]);
    const end = new Date(parts[parts.length - 1]);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffMs = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

      return {
        startDate: formatFriendly(start),
        endDate: formatFriendly(end),
        totalDays: `${days} ${days === 1 ? "Day" : "Days"}`,
      };
    }
  }

  const single = new Date(travelDateStr);

  if (!isNaN(single.getTime())) {
    return {
      startDate: formatFriendly(single),
      endDate: formatFriendly(single),
      totalDays: "1 Day",
    };
  }

  return {
    startDate: travelDateStr,
    endDate: travelDateStr,
    totalDays: "N/A",
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -2,
  },

  tripHeaderCard: {
    backgroundColor: "#F8FBFA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  tripTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  metaText: {
    fontSize: 15,
    color: "#555555",
    fontWeight: "500",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
    marginTop: 10,
    marginBottom: 12,
  },

  infoGridCard: {
    backgroundColor: "#F8FBFA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F0EE",
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5F3",
  },

  infoRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: 14,
    color: "#222222",
    fontWeight: "600",
  },

  descriptionCard: {
    backgroundColor: "#F8FBFA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F0EE",
    marginBottom: 24,
  },

  descriptionText: {
    fontSize: 15,
    color: "#444444",
    lineHeight: 22,
  },

  actionGrid: {
    gap: 12,
    marginBottom: 24,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFA",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E5F4F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  actionContent: {
    flex: 1,
  },

  actionButtonText: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
  },

  actionDescription: {
    color: "#777777",
    fontSize: 13,
  },

  editButton: {
    backgroundColor: "#F1F5F4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  editButtonText: {
    color: "#4B918C",
    fontSize: 16,
    fontWeight: "600",
  },

  deleteButton: {
    backgroundColor: "#FFF2F2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#D9534F",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function TripDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        if (!id) return;

        const data = await getTripById(id);
        setTrip(data);
      } catch (error) {
        console.log("Error loading trip:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!id) return;
              await deleteTrip(id);
              router.back();
            } catch (error) {
              console.log("Error deleting trip:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4B918C" />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 16, color: "#777777" }}>
            Trip not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { startDate, endDate, totalDays } = parseTripDates(trip.travelDate);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Back Navigation */}
        <View style={styles.headerRow}>
          <BackButton fallbackRoute="/(tabs)/homepage"/>
        </View>

        {/* Trip Title & Location Banner */}
        <View style={styles.tripHeaderCard}>
          <Text style={styles.tripTitle}>{trip.tripName}</Text>

          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color="#4B918C"
            />
            <Text style={styles.metaText}>{trip.destination}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#4B918C"
            />
            <Text style={styles.metaText}>{trip.travelDate}</Text>
          </View>
        </View>

        {/* Trip Details Card */}
        <Text style={styles.sectionTitle}>Trip Information 📋</Text>

        <View style={styles.infoGridCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue}>{trip.destination}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>{startDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date</Text>
            <Text style={styles.infoValue}>{endDate}</Text>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={styles.infoLabel}>Total Duration</Text>
            <Text style={styles.infoValue}>{totalDays}</Text>
          </View>
        </View>

        {/* Description Section */}
        <Text style={styles.sectionTitle}>Description 📝</Text>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            {trip.description || "No description added"}
          </Text>
        </View>

        {/* Trip Features */}
        <Text style={styles.sectionTitle}>Trip Features</Text>

        <View style={styles.actionGrid}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/packing-list",
                params: { id },
              })
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#4B918C"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>
                Packing List
              </Text>

              <Text style={styles.actionDescription}>
                Organize what to bring
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#777777"
            />
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/notes",
                params: { id },
              })
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#4B918C"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>
                Notes
              </Text>

              <Text style={styles.actionDescription}>
                Save important trip notes
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#777777"
            />
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/itinerary",
                params: { id },
              })
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#4B918C"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>
                Itinerary
              </Text>

              <Text style={styles.actionDescription}>
                Plan your activities
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#777777"
            />
          </Pressable>
        </View>

        {/* Edit & Delete Buttons */}
        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/edit-trip",
              params: { id },
            })
          }
        >
          <Text style={styles.editButtonText}>
            Edit Trip Details ✏️
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>
            Delete Trip 🗑️
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
