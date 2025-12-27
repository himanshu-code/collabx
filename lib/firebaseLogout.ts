import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function firebaseLogout() {
  await signOut(auth);
}
