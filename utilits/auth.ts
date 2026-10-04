import { getCurrentUser } from "@/services/firebase";

export function assertUserAuthenticated() {
    const user=getCurrentUser();
    if (!user) {
        throw new Error("User is not authenticated");
    }
    return user;
}