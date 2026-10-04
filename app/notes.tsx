import { BackButton } from "@/components/back-button";
import { createNote, deleteNote, getNotes, updateNote } from "@/services/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Note {
  id: string;
  title: string;
  category: string;
  content: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES = ["Flights", "Things to do", "Budget", "Hotel"];

const CATEGORY_ICONS: Record<string, string> = {
  Flights: "airplane-outline",
  "Things to do": "map-outline",
  Budget: "wallet-outline",
  Hotel: "bed-outline",
};

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

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4B918C",
    justifyContent: "center",
    alignItems: "center",
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F4",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 18,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#F8FBFA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  cardIconContainer: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: "#E5F4F1",
  justifyContent: "center",
  alignItems: "center",
},

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
    flexShrink: 1,
  },

  cardRightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cardDate: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "500",
    marginRight: 4,
  },

  actionIconButton: {
    padding: 4,
  },

  cardContent: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
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
    marginBottom: 16,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
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
    height: 100,
    textAlignVertical: "top",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F1F5F4",
  },

  activeCategoryChip: {
    backgroundColor: "#4B918C",
  },

  categoryChipText: {
    fontSize: 13,
    color: "#555555",
  },

  activeCategoryChipText: {
    color: "#FFFFFF",
    fontWeight: "600",
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

export default function Notes() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id?: string | string[] }>();
  const tripId = Array.isArray(searchParams.id) ? searchParams.id[0] : searchParams.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Flights");
  const [formContent, setFormContent] = useState("");

  useEffect(() => {
    const loadNotes = async () => {
      try {
        if (!tripId) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const data = await getNotes(tripId);

        const formattedNotes: Note[] = data.map((note: any) => ({
          id: note.id,
          title: note.title,
          category: note.category,
          content: note.content,
          date: note.createdAt?.toDate
            ? note.createdAt.toDate().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "",
          icon: (CATEGORY_ICONS[note.category] || "document-text-outline") as keyof typeof Ionicons.glyphMap,
        }));

        setNotes(formattedNotes);
      } catch (error) {
        console.log("Error loading notes:", error);
        Alert.alert("Error", "Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [tripId]);

  const openAddModal = () => {
    setEditingNoteId(null);
    setFormTitle("");
    setFormCategory("Flights");
    setFormContent("");
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormContent(note.content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveNote = async () => {
    if (!tripId) {
      Alert.alert("Error", "Trip ID is missing.");
      return;
    }

    if (!formTitle.trim() || !formContent.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter both a title and content for your note."
      );
      return;
    }

    try {
      if (editingNoteId) {
        await updateNote(
          editingNoteId,
          formTitle.trim(),
          formCategory,
          formContent.trim()
        );

        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === editingNoteId
              ? {
                  ...note,
                  title: formTitle.trim(),
                  category: formCategory,
                  content: formContent.trim(),
                  icon: (CATEGORY_ICONS[formCategory] || "document-text-outline") as keyof typeof Ionicons.glyphMap,
                }
              : note
          )
        );

        Alert.alert("Success", "Note updated successfully!");
      } else {
        const noteRef = await createNote(
          tripId,
          formTitle.trim(),
          formCategory,
          formContent.trim()
        );

        const now = new Date();

        const newNote: Note = {
          id: noteRef.id,
          title: formTitle.trim(),
          category: formCategory,
          content: formContent.trim(),
          date: now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          icon: (CATEGORY_ICONS[formCategory] || "document-text-outline") as keyof typeof Ionicons.glyphMap,
        };

        setNotes((currentNotes) => [newNote, ...currentNotes]);

        Alert.alert("Success", "Note added successfully!");
      }

      closeModal();
    } catch (error: any) {
      console.log("Error saving note:", error);

      Alert.alert(
        "Error",
        error?.message || "Failed to save note."
      );
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
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
              await deleteNote(noteId);

              setNotes((currentNotes) =>
                currentNotes.filter((note) => note.id !== noteId)
              );

              Alert.alert("Success", "Note deleted successfully!");
            } catch (error: any) {
              console.log("Error deleting note:", error);

              Alert.alert(
                "Error",
                error?.message || "Failed to delete note."
              );
            }
          },
        },
      ]
    );
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B918C" />
          <Text style={styles.loadingText}>Loading notes...</Text>
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

          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.title}>Notes 📝</Text>

        <Text style={styles.subtitle}>
          Keep track of your travel ideas and plans.
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888888"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color="#999999"
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconContainer}>
  <Ionicons
    name={item.icon}
    size={19}
    color="#4B918C"
  />
</View>

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>
              </View>

              <View style={styles.cardRightHeader}>
                <Text style={styles.cardDate}>
                  {item.date}
                </Text>

                <Pressable
                  style={styles.actionIconButton}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons
                    name="pencil"
                    size={16}
                    color="#4B918C"
                  />
                </Pressable>

                <Pressable
                  style={styles.actionIconButton}
                  onPress={() => handleDeleteNote(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color="#D9534F"
                  />
                </Pressable>
              </View>
            </View>

            <Text style={styles.cardContent}>
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No notes found.
            </Text>
          </View>
        }
      />

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
                {editingNoteId
                  ? "Edit Note ✏️"
                  : "Add New Note 📝"}
              </Text>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  Note Title
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Flight Details"
                  placeholderTextColor="#999999"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  Category
                </Text>

                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryChip,
                        formCategory === cat &&
                          styles.activeCategoryChip,
                      ]}
                      onPress={() =>
                        setFormCategory(cat)
                      }
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          formCategory === cat &&
                            styles.activeCategoryChipText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  Content
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Write your note content here..."
                  placeholderTextColor="#999999"
                  multiline
                  value={formContent}
                  onChangeText={setFormContent}
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
                  onPress={handleSaveNote}
                >
                  <Text style={styles.saveButtonText}>
                    {editingNoteId
                      ? "Save Changes"
                      : "Save Note"}
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
