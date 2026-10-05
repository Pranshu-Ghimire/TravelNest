import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, createUserWithEmailAndPassword, signOut as firebaseSignOut, getAuth, initializeAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, initializeFirestore, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

const firebaseAuth = require("firebase/auth");
const persistence = typeof firebaseAuth?.getReactNativePersistence === "function" ? firebaseAuth.getReactNativePersistence(ReactNativeAsyncStorage) : undefined;


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPvhf43t2KqPjCuSycu_qScSx1cRxkxDc",
  authDomain: "travelnest-56b8f.firebaseapp.com",
  projectId: "travelnest-56b8f",
  storageBucket: "travelnest-56b8f.firebasestorage.app",
  messagingSenderId: "610946675569",
  appId: "1:610946675569:web:16a7e4fa1a6515ed903cd0",
  measurementId: "G-QCP6KHYPSG"
};

let app: FirebaseApp | null = null;
let auth: Auth;
let firestore: Firestore;

// Initialize Firebase
export function initializeFirebase() {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  try {
    auth = initializeAuth(app, { persistence });
  } catch (error) {
    console.log("Error initializing auth", error);
    auth = getAuth(app);
  }

  firestore = initializeFirestore(app, {});

  return { app, auth, firestore };
}


export function signUp(fullName: string, email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
    return updateProfile(userCredential.user, { displayName: fullName }).then(() => {
      return userCredential;
    });
  });
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function saveTrip(
  tripName: string,
  destination: string,
  travelDate: string,
  description: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const tripRef = await addDoc(collection(firestore, "trips"), {
    userId: user.uid,
    tripName,
    destination,
    travelDate,
    description,
    createdAt: serverTimestamp(),
  });

  return tripRef;
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function signOut() {
  return firebaseSignOut(auth);
}

export async function getTrips() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const tripsQuery = query(
    collection(firestore, "trips"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(tripsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getTripById(tripId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const tripRef = doc(firestore, "trips", tripId);
  const snapshot = await getDoc(tripRef);

  if (!snapshot.exists()) {
    throw new Error("Trip not found");
  }

  const tripData = snapshot.data();

  if (tripData.userId !== user.uid) {
    throw new Error("You are not allowed to view this trip");
  }

  return {
    id: snapshot.id,
    ...tripData,
  };
}

export async function deleteTrip(tripId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const tripRef = doc(firestore, "trips", tripId);
  const snapshot = await getDoc(tripRef);

  if (!snapshot.exists()) {
    throw new Error("Trip not found");
  }

  const tripData = snapshot.data();

  if (tripData.userId !== user.uid) {
    throw new Error("You are not allowed to delete this trip");
  }

  await deleteDoc(tripRef);
}

export async function updateTrip(
  tripId: string,
  tripName: string,
  destination: string,
  travelDate: string,
  description: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const tripRef = doc(firestore, "trips", tripId);
  const snapshot = await getDoc(tripRef);

  if (!snapshot.exists()) {
    throw new Error("Trip not found");
  }

  const tripData = snapshot.data();

  if (tripData.userId !== user.uid) {
    throw new Error("You are not allowed to edit this trip");
  }

  await updateDoc(tripRef, {
    tripName,
    destination,
    travelDate,
    description,
  });
}

export async function getPackingItems(tripId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const packingRef = collection(firestore, "packingItems");

  const packingQuery = query(
    packingRef,
    where("tripId", "==", tripId),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(packingQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updatePackingItem(
  itemId: string,
  checked: boolean
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const itemRef = doc(firestore, "packingItems", itemId);
  const snapshot = await getDoc(itemRef);

  if (!snapshot.exists()) {
    throw new Error("Packing item not found");
  }

  const itemData = snapshot.data();

  if (itemData.userId !== user.uid) {
    throw new Error("You are not allowed to update this item");
  }

  await updateDoc(itemRef, {
    checked,
  });
}

export async function createPackingItems(tripId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const defaultItems = [
    { name: "Passport", category: "Essentials" },
    { name: "Wallet", category: "Essentials" },
    { name: "Travel Insurance", category: "Essentials" },
    { name: "Phone & Charger", category: "Essentials" },

    { name: "T-shirts", category: "Clothing" },
    { name: "Jeans", category: "Clothing" },
    { name: "Jacket", category: "Clothing" },
    { name: "Shoes", category: "Clothing" },
    { name: "Socks", category: "Clothing" },

    { name: "Toothbrush", category: "Toiletries" },
    { name: "Toothpaste", category: "Toiletries" },
    { name: "Shampoo", category: "Toiletries" },
    { name: "Sunscreen", category: "Toiletries" },
  ];

  for (const item of defaultItems) {
    await addDoc(collection(firestore, "packingItems"), {
      tripId,
      userId: user.uid,
      name: item.name,
      category: item.category,
      checked: false,
    });
  }
}

export async function getNotes(tripId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const notesRef = collection(firestore, "notes");

  const notesQuery = query(
    notesRef,
    where("tripId", "==", tripId),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(notesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createNote(
  tripId: string,
  title: string,
  category: string,
  content: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const noteRef = await addDoc(collection(firestore, "notes"), {
    tripId,
    userId: user.uid,
    title,
    category,
    content,
    createdAt: serverTimestamp(),
  });

  return noteRef;
}

export async function updateNote(
  noteId: string,
  title: string,
  category: string,
  content: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const noteRef = doc(firestore, "notes", noteId);
  const snapshot = await getDoc(noteRef);

  if (!snapshot.exists()) {
    throw new Error("Note not found");
  }

  const noteData = snapshot.data();

  if (noteData.userId !== user.uid) {
    throw new Error("You are not allowed to update this note");
  }

  await updateDoc(noteRef, {
    title,
    category,
    content,
  });
}

export async function deleteNote(noteId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const noteRef = doc(firestore, "notes", noteId);
  const snapshot = await getDoc(noteRef);

  if (!snapshot.exists()) {
    throw new Error("Note not found");
  }

  const noteData = snapshot.data();

  if (noteData.userId !== user.uid) {
    throw new Error("You are not allowed to delete this note");
  }

  await deleteDoc(noteRef);
}

export async function getItineraryItems(tripId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const itineraryRef = collection(firestore, "itineraryItems");

  const itineraryQuery = query(
    itineraryRef,
    where("tripId", "==", tripId),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(itineraryQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createItineraryItem(
  tripId: string,
  activityName: string,
  day: string,
  time: string,
  location: string,
  description: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const itineraryRef = await addDoc(
    collection(firestore, "itineraryItems"),
    {
      tripId,
      userId: user.uid,
      activityName,
      day,
      time,
      location,
      description,
      createdAt: serverTimestamp(),
    }
  );

  return itineraryRef;
}

export async function updateItineraryItem(
  itemId: string,
  activityName: string,
  day: string,
  time: string,
  location: string,
  description: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const itemRef = doc(firestore, "itineraryItems", itemId);
  const snapshot = await getDoc(itemRef);

  if (!snapshot.exists()) {
    throw new Error("Itinerary item not found");
  }

  const itemData = snapshot.data();

  if (itemData.userId !== user.uid) {
    throw new Error("You are not allowed to update this itinerary item");
  }

  await updateDoc(itemRef, {
    activityName,
    day,
    time,
    location,
    description,
  });
}

export async function deleteItineraryItem(itemId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in");
  }

  const itemRef = doc(firestore, "itineraryItems", itemId);
  const snapshot = await getDoc(itemRef);

  if (!snapshot.exists()) {
    throw new Error("Itinerary item not found");
  }

  const itemData = snapshot.data();

  if (itemData.userId !== user.uid) {
    throw new Error("You are not allowed to delete this itinerary item");
  }

  await deleteDoc(itemRef);
}

export { app, auth, firestore };