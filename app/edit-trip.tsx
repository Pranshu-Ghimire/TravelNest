import { BackButton } from "@/components/back-button";
import { getTripById, updateTrip } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function formatToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFriendly(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function parseStoredDate(dateStr?: string): { start: Date | null; end: Date | null } {
  if (!dateStr || !dateStr.trim()) return { start: null, end: null };

  const parts = dateStr.split(" - ");
  if (parts.length === 2) {
    const d1 = new Date(parts[0].trim());
    const d2 = new Date(parts[1].trim());
    return {
      start: !isNaN(d1.getTime()) ? d1 : null,
      end: !isNaN(d2.getTime()) ? d2 : null,
    };
  }

  const d = new Date(dateStr.trim());
  return {
    start: !isNaN(d.getTime()) ? d : null,
    end: null,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222222",
    marginTop: 20,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 8,
  },

  form: {
    padding: 20,
    gap: 20,
  },

  fieldContainer: {
    gap: 8,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D8E5E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333333",
  },

  datePickerInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8E5E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F8FBFA",
    gap: 10,
  },

  dateText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
  },

  placeholderText: {
    fontSize: 15,
    color: "#999999",
  },

  textArea: {
    height: 110,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#4B918C",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function EditTrip() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);

  const [isStartDatePickerVisible, setIsStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        if (!id) return;

        const trip: any = await getTripById(id);

        setTripName(trip.tripName || "");
        setDestination(trip.destination || "");
        setDescription(trip.description || "");

        const parsed = parseStoredDate(trip.travelDate);
        setStartDate(parsed.start);
        setEndDate(parsed.end);
      } catch (error) {
        console.log("Error loading trip:", error);
        Toast.show({
          type: "error",
          text1: "Failed to load trip",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  const handleConfirmStartDate = (date: Date) => {
    setIsStartDatePickerVisible(false);
    setStartDate(date);

    if (endDate && endDate < date) {
      setEndDate(null);
      Toast.show({
        type: "info",
        text1: "End date reset",
        text2: "Please select an end date on or after the start date.",
      });
    }
  };

  const handleConfirmEndDate = (date: Date) => {
    setIsEndDatePickerVisible(false);

    if (startDate && date < startDate) {
      Toast.show({
        type: "error",
        text1: "Invalid End Date",
        text2: "End date cannot be before start date.",
      });
      return;
    }

    setEndDate(date);
  };

  const handleUpdateTrip = async () => {
    if (!tripName || !destination || !startDate || !endDate) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields",
        text2: "Trip Name, Destination, Start Date, and End Date are required.",
      });
      return;
    }

    if (endDate < startDate) {
      Toast.show({
        type: "error",
        text1: "Invalid Date Range",
        text2: "End date cannot be before start date.",
      });
      return;
    }

    const travelDateStr = `${formatToISO(startDate)} - ${formatToISO(endDate)}`;

    try {
      if (!id) return;

      await updateTrip(
        id,
        tripName,
        destination,
        travelDateStr,
        description
      );

      Toast.show({
        type: "success",
        text1: "Trip updated successfully!",
      });

      router.back();
    } catch (error: any) {
      console.log("Update trip error:", error);

      Toast.show({
        type: "error",
        text1: "Failed to update trip",
        text2: error?.message || "Unknown error",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4B918C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <BackButton />

          <Text style={styles.title}>Edit Trip ✏️</Text>

          <Text style={styles.subtitle}>Update your trip details.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Trip Name *</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Nepal Adventure"
              value={tripName}
              onChangeText={setTripName}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Destination *</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Pokhara"
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Start Date *</Text>
            <Pressable
              style={styles.datePickerInput}
              onPress={() => setIsStartDatePickerVisible(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4B918C" />
              <Text style={startDate ? styles.dateText : styles.placeholderText}>
                {startDate ? formatFriendly(startDate) : "Select start date"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>End Date *</Text>
            <Pressable
              style={styles.datePickerInput}
              onPress={() => setIsEndDatePickerVisible(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4B918C" />
              <Text style={endDate ? styles.dateText : styles.placeholderText}>
                {endDate ? formatFriendly(endDate) : "Select end date"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your trip..."
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <Pressable style={styles.button} onPress={handleUpdateTrip}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </Pressable>
        </View>

        {/* Start Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          date={startDate || new Date()}
          onConfirm={handleConfirmStartDate}
          onCancel={() => setIsStartDatePickerVisible(false)}
        />

        {/* End Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          date={endDate || startDate || new Date()}
          minimumDate={startDate || undefined}
          onConfirm={handleConfirmEndDate}
          onCancel={() => setIsEndDatePickerVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
