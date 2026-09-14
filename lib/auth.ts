import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

const googleProvider = new GoogleAuthProvider();

/**
 * ============================================================
 * USER RECORD
 * ============================================================
 *
 * Creates the main user document.
 *
 * IMPORTANT:
 * - Users cannot choose their role.
 * - Every newly created account starts as "student".
 * - Profile information is handled separately.
 */
export async function createUserRecord(user: User) {
  const userRef = doc(db, "users", user.uid);

  const existingUser = await getDoc(userRef);

  if (!existingUser.exists()) {
    await setDoc(userRef, {
  uid: user.uid,
  email: user.email || "",
  role: "student",
  status: "active",
  createdAt: serverTimestamp(),
  lastActiveAt: serverTimestamp(),
});
  }
}

/**
 * ============================================================
 * EMAIL / PASSWORD REGISTRATION
 * ============================================================
 *
 * New account flow:
 *
 * Email + Password
 *       ↓
 * Firebase account created
 *       ↓
 * Verification email sent
 *       ↓
 * User verifies email
 *       ↓
 * Complete Profile
 *
 * Name and country are NOT collected here.
 */
export async function registerWithEmail(
  email: string,
  password: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  const user = credential.user;

  // Create the basic user record.
  await createUserRecord(user);

  // Send Firebase verification email.
  await sendEmailVerification(user);

  return user;
}

/**
 * ============================================================
 * EMAIL / PASSWORD LOGIN
 * ============================================================
 *
 * Existing user:
 *
 * Email + Password
 *       ↓
 * Firebase Login
 *       ↓
 * Dashboard
 */
export async function loginWithEmail(
  email: string,
  password: string,
) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  const user = credential.user;

  // Make sure the main user record exists.
  await createUserRecord(user);

  return user;
}

/**
 * ============================================================
 * CONTINUE WITH EMAIL
 * ============================================================
 *
 * The UI has one Continue button.
 *
 * Existing account:
 *   → Login
 *
 * New account:
 *   → Create account
 *   → Send verification email
 *
 * The UI does not need separate Login/Register buttons.
 */
export async function continueWithEmail(
  email: string,
  password: string,
) {
  try {
    const user = await registerWithEmail(
      email,
      password,
    );

    return {
      type: "register" as const,
      user,
    };
  } catch (error: unknown) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String(
            (error as { code?: unknown }).code,
          )
        : "";

    if (code === "auth/email-already-in-use") {
      const user = await loginWithEmail(
        email,
        password,
      );

      return {
        type: "login" as const,
        user,
      };
    }

    throw error;
  }
}


/**
 * ============================================================
 * GOOGLE LOGIN
 * ============================================================
 *
 * Google flow:
 *
 * Continue with Google
 *       ↓
 * Existing Sigma-Sprint profile?
 *       ↓
 * YES → Dashboard
 * NO  → Complete Profile
 */
export async function loginWithGoogle() {
  const credential = await signInWithPopup(
    auth,
    googleProvider,
  );

  const user = credential.user;

  // Create the basic user record if this is
  // the user's first time using Sigma-Sprint.
  await createUserRecord(user);

  return user;
}

/**
 * ============================================================
 * PROFILE CHECK
 * ============================================================
 *
 * Determines whether the user has completed
 * their Sigma-Sprint profile.
 *
 * Required:
 * - displayName
 * - email
 *
 * Optional:
 * - bio
 * - avatarUrl
 */
export async function hasCompletedProfile(uid: string) {
  const profileRef = doc(db, "profiles", uid);

  const profileSnapshot = await getDoc(profileRef);

  if (!profileSnapshot.exists()) {
    return false;
  }

  const profile = profileSnapshot.data();

  return Boolean(
    profile.displayName &&
      profile.email,
  );
}

/**
 * ============================================================
 * SAVE PROFILE
 * ============================================================
 *
 * Profile fields:
 *
 * - displayName
 * - email
 * - bio
 * - avatarUrl
 *
 * This is called AFTER the user has verified their
 * email (email signup) or after first-time Google signup.
 */
export async function saveProfile(
  user: User,
  data: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
  },
) {
  const displayName = data.displayName.trim();
  const bio = data.bio?.trim() || "";

  const avatarUrl =
    data.avatarUrl ||
    user.photoURL ||
    "";

  const profileRef = doc(db, "profiles", user.uid);

  await setDoc(
    profileRef,
    {
      uid: user.uid,
      displayName,
      email: user.email || "",
      bio,
      avatarUrl,
    },
    {
      merge: true,
    },
  );

  /**
   * Keep Firebase Authentication profile
   * synchronized with Sigma-Sprint profile.
   */
  await updateProfile(user, {
    displayName,
    photoURL: avatarUrl || null,
  });
}

/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */
export async function logout() {
  await signOut(auth);
}