import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface TripSelectModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  trips: Array<{ id: string; tripName: string; destination: string; travelDate: string }>;
  onSelectTrip: (tripId: string) => void;
  onClose: () => void;
}

export function TripSelectModal({
  visible,
  title,
  subtitle = "Select a trip to continue",
  trips,
  onSelectTrip,
  onClose,
}: TripSelectModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#777777" />
            </Pressable>
          </View>

          <ScrollView style={styles.tripList} contentContainerStyle={styles.listContent}>
            {trips.length === 0 ? (
              <Text style={styles.emptyText}>No trips found. Create a trip first!</Text>
            ) : (
              trips.map((trip) => (
                <Pressable
                  key={trip.id}
                  style={styles.tripCard}
                  onPress={() => {
                    onSelectTrip(trip.id);
                    onClose();
                  }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.tripName}>{trip.tripName}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#4B918C" />
                  </View>
                  <Text style={styles.destination}>📍 {trip.destination}</Text>
                  <Text style={styles.dates}>📅 {trip.travelDate}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },

  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
  },

  closeBtn: {
    padding: 4,
  },

  tripList: {
    marginTop: 8,
  },

  listContent: {
    paddingBottom: 20,
    gap: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#777777",
    paddingVertical: 20,
  },

  tripCard: {
    backgroundColor: "#F8FBFA",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tripName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
  },

  destination: {
    fontSize: 13,
    color: "#555555",
    marginTop: 4,
  },

  dates: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },
});
