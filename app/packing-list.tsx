import { BackButton } from "@/components/back-button";
import { getPackingItems, updatePackingItem } from "@/services/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  flexDirection: "row",
  marginTop: 24,
  paddingHorizontal: 20,
  gap: 8,
},

tab: {
  paddingHorizontal: 15,
  paddingVertical: 9,
  borderRadius: 20,
  backgroundColor: "#F1F5F4",
  borderWidth: 1,
  borderColor: "#E2EBE9",
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
});

export default function PackingList() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(searchParams.id) ? searchParams.id[0] : searchParams.id;

  const [activeTab, setActiveTab] = useState("All");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredItems =
    activeTab === "All"
      ? items
      : items.filter((item) => item.category === activeTab);

  const categories =
    activeTab === "All"
      ? ["Essentials", "Clothing", "Toiletries"]
      : [activeTab];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
<BackButton
  onPress={() => {
    if (id) {
      router.push({ pathname: "/trip-details", params: { id } });
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

      <View style={styles.tabs}>
        {["All", "Essentials", "Clothing", "Toiletries"].map((tab) => (
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
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B918C" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No packing items found for this trip.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {categories.map((category) => {
            const categoryItems = filteredItems.filter(
              (item) => item.category === category
            );

            if (categoryItems.length === 0) return null;

            return (
              <View key={category}>
                <Text style={styles.sectionTitle}>{category}</Text>

                {categoryItems.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.item}
                    onPress={() => toggleItem(item.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.checked && styles.checkedBox,
                      ]}
                    >
                      {item.checked && (
                        <Text style={styles.check}>✓</Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.itemText,
                        item.checked && styles.checkedText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}