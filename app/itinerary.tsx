import { BackButton } from "@/components/back-button";
import { createItineraryItem, deleteItineraryItem, getItineraryItems, updateItineraryItem } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Activity {
  id: string;
  day: string;
  time: string;
  title: string;
  location?: string;
  description?: string;
}

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

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  addActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4B918C",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },

  addActivityButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
  },

  dayGroup: {
    marginBottom: 26,
  },

  dayTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 12,
    paddingLeft: 2,
  },

  activityCard: {
    backgroundColor: "#F8FBFA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  activityTitleRow: {
    flex: 1,
    paddingRight: 10,
  },

  timeBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B918C",
    marginBottom: 5,
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    lineHeight: 21,
  },

  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E5F4F1",
    justifyContent: "center",
    alignItems: "center",
  },

locationRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
  marginTop: 10,
},

locationText: {
  fontSize: 13,
  color: "#666666",
  fontWeight: "500",
  flex: 1,
},

descriptionText: {
  fontSize: 14,
  color: "#555555",
  marginTop: 8,
  lineHeight: 20,
},

emptyContainer: {
  paddingVertical: 60,
  paddingHorizontal: 20,
  alignItems: "center",
},

emptyIconContainer: {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: "#E5F4F1",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 14,
},

emptyTitle: {
  fontSize: 17,
  fontWeight: "700",
  color: "#222222",
  marginBottom: 6,
},

emptySubtitle: {
  fontSize: 14,
  color: "#777777",
  textAlign: "center",
  lineHeight: 20,
},

  emptyText: {
    fontSize: 15,
    color: "#777777",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777777",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 16,
  },

  formField: {
    marginBottom: 14,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D8E5E3",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
    backgroundColor: "#F8FBFA",
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },

  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F4",
  },

  cancelButtonText: {
    color: "#666666",
    fontSize: 15,
    fontWeight: "600",
  },

  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#4B918C",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default function Itinerary() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id?: string | string[] }>();
  const tripId = Array.isArray(searchParams.id) ? searchParams.id[0] : searchParams.id;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );

  const [formTitle, setFormTitle] = useState("");
  const [formDay, setFormDay] = useState("Day 1");
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Load itinerary from Firebase
  useEffect(() => {
    const loadActivities = async () => {
      try {
        if (!tripId) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const data = await getItineraryItems(tripId);

        const formattedActivities: Activity[] = data.map((item: any) => ({
          id: item.id,
          day: item.day,
          time: item.time,
          title: item.activityName,
          location: item.location || undefined,
          description: item.description || undefined,
        }));

        setActivities(formattedActivities);
      } catch (error) {
        console.log("Error loading itinerary:", error);
        Alert.alert("Error", "Failed to load itinerary.");
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [tripId]);

  const openAddModal = () => {
    setEditingActivityId(null);
    setFormTitle("");
    setFormDay("Day 1");
    setFormTime("");
    setFormLocation("");
    setFormDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setFormTitle(activity.title);
    setFormDay(activity.day);
    setFormTime(activity.time);
    setFormLocation(activity.location || "");
    setFormDescription(activity.description || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveActivity = async () => {
    if (!tripId) {
      Alert.alert("Error", "Trip ID is missing.");
      return;
    }

    if (!formTitle.trim() || !formDay.trim() || !formTime.trim()) {
      Alert.alert(
        "Missing Fields",
        "Please enter Activity Name, Day, and Time."
      );
      return;
    }

    try {
      if (editingActivityId) {
        // Update existing activity
        await updateItineraryItem(
          editingActivityId,
          formTitle.trim(),
          formDay.trim(),
          formTime.trim(),
          formLocation.trim(),
          formDescription.trim()
        );

        setActivities((current) =>
          current.map((act) =>
            act.id === editingActivityId
              ? {
                  ...act,
                  title: formTitle.trim(),
                  day: formDay.trim(),
                  time: formTime.trim(),
                  location: formLocation.trim() || undefined,
                  description: formDescription.trim() || undefined,
                }
              : act
          )
        );

        Alert.alert("Success", "Activity updated successfully!");
      } else {
        // Create new activity
        const itemRef = await createItineraryItem(
          tripId,
          formTitle.trim(),
          formDay.trim(),
          formTime.trim(),
          formLocation.trim(),
          formDescription.trim()
        );

        const newActivity: Activity = {
          id: itemRef.id,
          title: formTitle.trim(),
          day: formDay.trim(),
          time: formTime.trim(),
          location: formLocation.trim() || undefined,
          description: formDescription.trim() || undefined,
        };

        setActivities((current) => [...current, newActivity]);

        Alert.alert("Success", "Activity added successfully!");
      }

      closeModal();
    } catch (error: any) {
      console.log("Error saving activity:", error);

      Alert.alert(
        "Error",
        error?.message || "Failed to save activity."
      );
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteItineraryItem(activityId);

              setActivities((current) =>
                current.filter((act) => act.id !== activityId)
              );

              Alert.alert("Success", "Activity deleted successfully!");
            } catch (error: any) {
              console.log("Error deleting activity:", error);

              Alert.alert(
                "Error",
                error?.message || "Failed to delete activity."
              );
            }
          },
        },
      ]
    );
  };

  // Group activities by day
  const uniqueDays = Array.from(
    new Set(activities.map((act) => act.day))
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B918C" />
          <Text style={styles.loadingText}>Loading itinerary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <BackButton
            onPress={() => {
              if (tripId) {
                router.push({ pathname: "/trip-details", params: { id: tripId } });
              } else {
                router.back();
              }
            }}
          />

          <Pressable
            style={styles.addActivityButton}
            onPress={openAddModal}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addActivityButtonText}>
              Add Activity
            </Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Itinerary 🗓️</Text>
        <Text style={styles.subtitle}>
          Plan your activities day by day.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {uniqueDays.length === 0 ? (
          <View style={styles.emptyContainer}>
  <View style={styles.emptyIconContainer}>
    <Ionicons
      name="calendar-outline"
      size={30}
      color="#4B918C"
    />
  </View>

  <Text style={styles.emptyTitle}>
    Your itinerary is empty
  </Text>

  <Text style={styles.emptySubtitle}>
    Start planning your adventure by adding your first activity.
  </Text>
</View>
        ) : (
          uniqueDays.map((day) => {
            const dayActivities = activities.filter(
              (act) => act.day === day
            );

            return (
              <View key={day} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{day}</Text>

                {dayActivities.map((activity) => (
                  <View
                    key={activity.id}
                    style={styles.activityCard}
                  >
                    <View style={styles.activityHeader}>
                      <View style={styles.activityTitleRow}>
                        <Text style={styles.timeBadge}>
                          {activity.time}
                        </Text>

                        <Text style={styles.activityTitle}>
                          {activity.title}
                        </Text>
                      </View>

                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          style={styles.iconBtn}
                          onPress={() =>
                            openEditModal(activity)
                          }
                        >
                          <Ionicons
                            name="pencil"
                            size={16}
                            color="#4B918C"
                          />
                        </Pressable>

                        <Pressable
                          style={styles.iconBtn}
                          onPress={() =>
                            handleDeleteActivity(activity.id)
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#D9534F"
                          />
                        </Pressable>
                      </View>
                    </View>

                    {activity.location ? (
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#666666"
                        />

                        <Text style={styles.locationText}>
                          {activity.location}
                        </Text>
                      </View>
                    ) : null}

                    {activity.description ? (
                      <Text style={styles.descriptionText}>
                        {activity.description}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add / Edit Activity Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editingActivityId
                  ? "Edit Activity ✏️"
                  : "Add Activity 🗓️"}
              </Text>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  Activity Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Visit Shibuya"
                  placeholderTextColor="#999999"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Day</Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Day 1 — Arrival in Tokyo"
                  placeholderTextColor="#999999"
                  value={formDay}
                  onChangeText={setFormDay}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Time</Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9:00 AM"
                  placeholderTextColor="#999999"
                  value={formTime}
                  onChangeText={setFormTime}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Location</Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Shibuya Crossing"
                  placeholderTextColor="#999999"
                  value={formLocation}
                  onChangeText={setFormLocation}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  Description
                </Text>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Walk around and explore local shops..."
                  placeholderTextColor="#999999"
                  multiline
                  value={formDescription}
                  onChangeText={setFormDescription}
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSaveActivity}
                >
                  <Text style={styles.saveButtonText}>
                    {editingActivityId
                      ? "Save Changes"
                      : "Save Activity"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
