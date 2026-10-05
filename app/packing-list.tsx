import { BackButton } from "@/components/back-button";
import {
  createCustomPackingItem,
  getPackingItems,
  updatePackingItem,
} from "@/services/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  tabs: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 8,
    alignItems: "center",
  },

  tab: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F1F5F4",
    borderWidth: 1,
    borderColor: "#E2EBE9",
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#4B918C",
    borderColor: "#4B918C",
  },

  tabText: {
    fontSize: 13,
    color: "#555555",
    fontWeight: "500",
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyText: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
    marginTop: 18,
    marginBottom: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFA",
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#E6F0EE",
  },

  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 1.5,
    borderColor: "#4B918C",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  checkedBox: {
    backgroundColor: "#4B918C",
    borderColor: "#4B918C",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
  },

  checkedText: {
    textDecorationLine: "line-through",
    color: "#999999",
    fontWeight: "400",
  },

  otherContainer: {
    marginBottom: 8,
  },

  otherInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  otherInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#F8FBFA",
    borderWidth: 1,
    borderColor: "#E6F0EE",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333333",
  },

  addButton: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#4B918C",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonDisabled: {
    opacity: 0.5,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default function PackingList() {
  const router = useRouter();

  const searchParams =
    useLocalSearchParams<{ id?: string | string[] }>();

  const id = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id;

  const [activeTab, setActiveTab] = useState("All");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [customItem, setCustomItem] = useState("");
  const [addingCustomItem, setAddingCustomItem] = useState(false);

  useEffect(() => {
    const loadPackingItems = async () => {
      try {
        if (!id) return;

        const data = await getPackingItems(id);
        setItems(data);
      } catch (error) {
        console.log("Error loading packing items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPackingItems();
  }, [id]);

  const toggleItem = async (itemId: string) => {
    const item = items.find((item) => item.id === itemId);

    if (!item) return;

    const newCheckedValue = !item.checked;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, checked: newCheckedValue }
          : item
      )
    );

    try {
      await updatePackingItem(itemId, newCheckedValue);
    } catch (error) {
      console.log("Error updating packing item:", error);
    }
  };

  const handleAddCustomItem = async () => {
    const trimmedItem = customItem.trim();

    if (!trimmedItem || !id || addingCustomItem) {
      return;
    }

    try {
      setAddingCustomItem(true);

      const newItem = await createCustomPackingItem(
        id,
        trimmedItem
      );

      setItems((currentItems) => [
        ...currentItems,
        newItem,
      ]);

      setCustomItem("");
    } catch (error) {
      console.log(
        "Error adding custom packing item:",
        error
      );
    } finally {
      setAddingCustomItem(false);
    }
  };

  const filteredItems =
    activeTab === "All"
      ? items
      : items.filter(
        (item) => item.category === activeTab
      );

  const categories =
    activeTab === "All"
      ? ["Essentials", "Clothing", "Toiletries", "Other"]
      : [activeTab];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton
          onPress={() => {
            if (id) {
              router.push({
                pathname: "/trip-details",
                params: { id },
              });
            } else {
              router.back();
            }
          }}
        />

        <Text style={styles.title}>Packing List</Text>

        <Text style={styles.subtitle}>
          Everything you need for your adventure.
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {[
          "All",
          "Essentials",
          "Clothing",
          "Toiletries",
          "Other",
        ].map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab &&
                styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4B918C"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
        >
          {/* Add Custom Item */}
          {activeTab === "Other" && (
            <View style={styles.otherContainer}>
              <Text style={styles.sectionTitle}>
                Add your own item
              </Text>

              <View style={styles.otherInputRow}>
                <TextInput
                  style={styles.otherInput}
                  placeholder="e.g. Camera"
                  placeholderTextColor="#999999"
                  value={customItem}
                  onChangeText={setCustomItem}
                  editable={!addingCustomItem}
                />

                <Pressable
                  style={[
                    styles.addButton,
                    (!customItem.trim() ||
                      addingCustomItem) &&
                    styles.addButtonDisabled,
                  ]}
                  onPress={handleAddCustomItem}
                  disabled={
                    !customItem.trim() ||
                    addingCustomItem
                  }
                >
                  {addingCustomItem ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={styles.addButtonText}
                    >
                      Add
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Packing Items */}
          {categories.map((category) => {
            const categoryItems =
              filteredItems.filter(
                (item) =>
                  item.category === category
              );

            if (categoryItems.length === 0) {
              return null;
            }

            return (
              <View key={category}>
                <Text style={styles.sectionTitle}>
                  {category}
                </Text>

                {categoryItems.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.item}
                    onPress={() =>
                      toggleItem(item.id)
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.checked &&
                        styles.checkedBox,
                      ]}
                    >
                      {item.checked && (
                        <Text style={styles.check}>
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.itemText,
                        item.checked &&
                        styles.checkedText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            );
          })}

          {/* Empty state for Other */}
          {activeTab === "Other" &&
            filteredItems.length === 0 && (
              <Text style={styles.emptyText}>
                Add your own packing items above.
              </Text>
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}