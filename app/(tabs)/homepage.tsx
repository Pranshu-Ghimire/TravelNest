import { TripSelectModal } from "@/components/trip-select-modal";
import { getNotes, getPackingItems, getTrips } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function parseCustomDate(str: string, defaultYear: number): Date | null {
  const clean = str.trim().toLowerCase();
  if (!clean) return null;

  const isoMatch = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return new Date(y, m, d);
  }

  const tokens = clean.split(/[^a-z0-9]+/i).filter(Boolean);
  let foundMonth: number | null = null;
  let foundDay: number | null = null;
  let foundYear: number | null = null;

  for (const token of tokens) {
    if (MONTH_MAP[token] !== undefined) {
      foundMonth = MONTH_MAP[token];
    } else if (/^\d+$/.test(token)) {
      const num = parseInt(token, 10);
      if (num >= 2000 && num <= 2100) {
        foundYear = num;
      } else if (num >= 1 && num <= 31 && foundDay === null) {
        foundDay = num;
      }
    }
  }

  if (foundMonth !== null && foundDay !== null) {
    const year = foundYear ?? defaultYear;
    return new Date(year, foundMonth, foundDay);
  }

  const nativeDate = new Date(str.trim());
  if (!isNaN(nativeDate.getTime())) {
    return new Date(nativeDate.getFullYear(), nativeDate.getMonth(), nativeDate.getDate());
  }

  return null;
}

function parseSingleDate(str: string, defaultYear: number): Date | null {
  const clean = str.trim();
  if (!clean) return null;

  const isoMatch = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return new Date(y, m, d);
  }

  return parseCustomDate(clean, defaultYear);
}

function getTripStatus(travelDateStr?: string): { text: string; bg: string } {
  if (!travelDateStr || !travelDateStr.trim()) {
    return { text: "🟢 Upcoming", bg: "#E8F5E9" };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const defaultYear = now.getFullYear();

  const parts = travelDateStr.trim().split(/\s+(?:-|–|—|to)\s+/i);

  if (parts.length >= 2) {
    const startDate = parseSingleDate(parts[0], defaultYear);
    const endDate = parseSingleDate(parts[parts.length - 1], defaultYear);

    if (startDate && endDate) {
      const startMs = Math.min(startDate.getTime(), endDate.getTime());
      const endMs = Math.max(startDate.getTime(), endDate.getTime());

      if (today < startMs) {
        return { text: "🟢 Upcoming", bg: "#E8F5E9" };
      } else if (today > endMs) {
        return { text: "⚪ Completed", bg: "#F5F5F5" };
      } else {
        return { text: "🔵 Ongoing", bg: "#E3F2FD" };
      }
    } else if (startDate) {
      const startMs = startDate.getTime();
      if (today < startMs) {
        return { text: "🟢 Upcoming", bg: "#E8F5E9" };
      } else if (today === startMs) {
        return { text: "🔵 Ongoing", bg: "#E3F2FD" };
      } else {
        return { text: "⚪ Completed", bg: "#F5F5F5" };
      }
    }
  }

  const singleDate = parseSingleDate(travelDateStr, defaultYear);
  if (singleDate) {
    const dateMs = singleDate.getTime();
    if (today < dateMs) {
      return { text: "🟢 Upcoming", bg: "#E8F5E9" };
    } else if (today === dateMs) {
      return { text: "🔵 Ongoing", bg: "#E3F2FD" };
    } else {
      return { text: "⚪ Completed", bg: "#F5F5F5" };
    }
  }

  return { text: "🟢 Upcoming", bg: "#E8F5E9" };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    backgroundColor: "#4B918C",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  greeting: {
    color: "#E5F4F1",
    fontSize: 15,
    fontWeight: "500",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
  },

  headerSubtitle: {
    color: "#E5F4F1",
    fontSize: 14,
    marginTop: 6,
    opacity: 0.9,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E5F4F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    marginTop: 20,
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },

  createButton: {
    width: "100%",
    backgroundColor: "#4B918C",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  tripCard: {
    width: "100%",
    backgroundColor: "#F8FBFA",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2EFEF",
  },

  tripHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tripName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222222",
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },

  tripMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  tripMetaText: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "500",
  },

  viewDetailsLink: {
    color: "#4B918C",
    marginTop: 12,
    fontWeight: "600",
    fontSize: 14,
  },

  summarySection: {
    gap: 12,
  },

  summaryCard: {
    backgroundColor: "#F8FBFA",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
  },

  summaryText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },

  summaryLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B918C",
    marginTop: 10,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777777",
  },

  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default function Home() {
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [packedSummary, setPackedSummary] = useState({ checked: 0, total: 0 });
  const [notesCount, setNotesCount] = useState(0);
  const [tripSelectType, setTripSelectType] = useState<"packing" | "notes" | "itinerary" | null>(null);

  const hasInitialLoaded = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const loadHomeData = async () => {
        try {
          // Only show full loading spinner on initial load when no trips are rendered
          if (!hasInitialLoaded.current) {
            setLoading(true);
          }

          const data = await getTrips();
          setTrips(data);

          // Fast parallel fetching for summaries
          const summaryResults = await Promise.all(
            data.map(async (trip) => {
              const [packingItems, notes] = await Promise.all([
                getPackingItems(trip.id),
                getNotes(trip.id),
              ]);
              const checkedCount = packingItems.filter(
                (item: any) => item.checked === true
              ).length;

              return {
                checked: checkedCount,
                total: packingItems.length,
                notesCount: notes.length,
              };
            })
          );

          let totalChecked = 0;
          let totalPackingItems = 0;
          let totalNotes = 0;

          for (const res of summaryResults) {
            totalChecked += res.checked;
            totalPackingItems += res.total;
            totalNotes += res.notesCount;
          }

          setPackedSummary({ checked: totalChecked, total: totalPackingItems });
          setNotesCount(totalNotes);
        } catch (error) {
          console.log("Error loading home data:", error);
        } finally {
          hasInitialLoaded.current = true;
          setLoading(false);
        }
      };

      loadHomeData();
    }, [])
  );

  const handleSelectTrip = (selectedTripId: string) => {
    if (tripSelectType === "packing") {
      router.push({
        pathname: "/packing-list" as any,
        params: { id: selectedTripId },
      });
    } else if (tripSelectType === "notes") {
      router.push({
        pathname: "/notes" as any,
        params: { id: selectedTripId },
      });
    } else if (tripSelectType === "itinerary") {
      router.push({
        pathname: "/itinerary" as any,
        params: { id: selectedTripId },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome 👋</Text>
        <Text style={styles.name}>Welcome to TravelNest</Text>
        <Text style={styles.headerSubtitle}>
          Plan your next adventure with ease.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B918C" />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : trips.length === 0 ? (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="airplane-outline"
                size={44}
                color="#4B918C"
              />
            </View>

            <Text style={[styles.title, { textAlign: "center" }]}>
              Your next adventure{"\n"}starts here!
            </Text>

            <Text style={styles.subtitle}>
              You haven't created any trips yet.{"\n"}
              Start planning your next journey today.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Your Trips ✈️</Text>

            {trips.map((trip) => {
              const status = getTripStatus(trip.travelDate);

              return (
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
                  <View style={styles.tripHeaderRow}>
                    <Text style={styles.tripName}>
                      {trip.tripName}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                  </View>

                  <View style={styles.tripMetaRow}>
                    <Ionicons name="location-outline" size={16} color="#E53935" />
                    <Text style={styles.tripMetaText}>{trip.destination}</Text>
                  </View>

                  <View style={styles.tripMetaRow}>
                    <Ionicons name="calendar-outline" size={16} color="#4B918C" />
                    <Text style={styles.tripMetaText}>{trip.travelDate}</Text>
                  </View>

                  <Text style={styles.viewDetailsLink}>
                    Tap to view details →
                  </Text>
                </Pressable>
              );
            })}

            {/* Overview Summaries */}
            <Text style={styles.sectionTitle}>Overview 📊</Text>

            <View style={styles.summarySection}>
              {/* Packing List Summary Card */}
              <Pressable
                style={styles.summaryCard}
                onPress={() => setTripSelectType("packing")}
              >
                <View style={styles.summaryTitleRow}>
                  <Ionicons name="briefcase-outline" size={20} color="#4B918C" />
                  <Text style={styles.summaryTitle}>Packing List</Text>
                </View>
                <Text style={styles.summaryText}>
                  Keep track of what you need to bring.
                </Text>
                <Text style={styles.summaryLink}>View Packing List →</Text>
              </Pressable>

              {/* Notes Summary Card */}
              <Pressable
                style={styles.summaryCard}
                onPress={() => setTripSelectType("notes")}
              >
                <View style={styles.summaryTitleRow}>
                  <Ionicons name="document-text-outline" size={20} color="#4B918C" />
                  <Text style={styles.summaryTitle}>Notes</Text>
                </View>
                <Text style={styles.summaryText}>
                  Save important information for your trip.
                </Text>
                <Text style={styles.summaryLink}>View Notes →</Text>
              </Pressable>

              <Pressable
                style={styles.summaryCard}
                onPress={() => setTripSelectType("itinerary")}
              >
                <View style={styles.summaryTitleRow}>
                  <Ionicons name="calendar-outline" size={20} color="#4B918C" />
                  <Text style={styles.summaryTitle}>Itinerary</Text>
                </View>
                <Text style={styles.summaryText}>
                  Plan your activities and things to do.
                </Text>
                <Text style={styles.summaryLink}>View Itinerary →</Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable
          style={styles.createButton}
          onPress={() => router.push("/create-trip")}
        >
          <Text style={styles.createButtonText}>
            Create New Trip
          </Text>
        </Pressable>
      </ScrollView>

      <TripSelectModal
        visible={tripSelectType !== null}
        title="Choose a Trip"
        subtitle={
          tripSelectType === "packing"
            ? "Select a trip to view its packing list"
            : "Select a trip to view its notes"
        }
        trips={trips}
        onSelectTrip={handleSelectTrip}
        onClose={() => setTripSelectType(null)}
      />
    </View>
  );
}