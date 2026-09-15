import {
  createUserWithEmailAndPassword,
  reload,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

/*
 * ============================================================
 * CREATE / UPDATE USER RECORD
 * ============================================================
 */

export async function createUserRecord(
  user: User,
  data?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    username?: string;
    usernameLower?: string;
    profileImage?: string;
  },
) {
  const userRef = doc(
    db,
    "users",
    user.uid,
  );

  const existingUser =
    await getDoc(userRef);

  const existingData =
    existingUser.exists()
      ? existingUser.data()
      : {};

  await setDoc(
    userRef,
    {
      uid: user.uid,

      email: user.email ?? "",

      firstName:
        data?.firstName ??
        existingData.firstName ??
        "",

      middleName:
        data?.middleName ??
        existingData.middleName ??
        "",

      lastName:
        data?.lastName ??
        existingData.lastName ??
        "",

      displayName:
        user.displayName ??
        existingData.displayName ??
        "",

      username:
        data?.username ??
        existingData.username ??
        "",

      usernameLower:
        data?.usernameLower ??
        existingData.usernameLower ??
        "",

      profileImage:
        data?.profileImage ??
        existingData.profileImage ??
        user.photoURL ??
        "",

      role:
        existingData.role ??
        "student",

      status:
        existingData.status ??
        "active",

      totalXP:
        existingData.totalXP ??
        0,

      totalSolved:
        existingData.totalSolved ??
        0,

      totalCorrect:
        existingData.totalCorrect ??
        0,

      lastActiveAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

/*
 * ============================================================
 * CREATE EMAIL/PASSWORD ACCOUNT
 * ============================================================
 */

export async function createEmailAccount(
  email: string,
  password: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

  return credential.user;
}

/*
 * ============================================================
 * EMAIL LOGIN
 * ============================================================
 */

export async function loginWithEmail(
  email: string,
  password: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const credential =
    await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

  const user =
    credential.user;

  await reload(user);

  const refreshedUser =
    auth.currentUser ?? user;

  await createUserRecord(
    refreshedUser,
  );

  return refreshedUser;
}

/*
 * ============================================================
 * SAVE NEW USER PROFILE
 * ============================================================
 *
 * Used during signup after Firebase Auth account creation.
 */

export async function saveNewUserProfile(
  user: User,
  data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    username: string;
    profileImage?: string;
  },
) {
  const firstName =
    data.firstName.trim();

  const middleName =
    data.middleName?.trim() ?? "";

  const lastName =
    data.lastName.trim();

  const username =
    data.username.trim();

  const usernameLower =
    username.toLowerCase();

  const profileImage =
    data.profileImage ??
    user.photoURL ??
    "";

  const displayName = [
    firstName,
    middleName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  if (!firstName) {
    throw new Error(
      "First name is required.",
    );
  }

  if (!lastName) {
    throw new Error(
      "Last name is required.",
    );
  }

  if (!username) {
    throw new Error(
      "Username is required.",
    );
  }

  await setDoc(
    doc(
      db,
      "users",
      user.uid,
    ),
    {
      uid: user.uid,

      firstName,
      middleName,
      lastName,

      displayName,

      username,
      usernameLower,

      email:
        user.email ?? "",

      profileImage,

      role: "student",
      status: "active",

      totalXP: 0,
      totalSolved: 0,
      totalCorrect: 0,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),

      lastActiveAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  await updateProfile(
    user,
    {
      displayName,
      photoURL:
        profileImage || null,
    },
  );
}

/*
 * ============================================================
 * GET USER PROFILE
 * ============================================================
 */

export async function getUserProfile(
  uid: string,
) {
  const userRef = doc(
    db,
    "users",
    uid,
  );

  const snapshot =
    await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

/*
 * ============================================================
 * LOGOUT
 * ============================================================
 */

export async function logout() {
  await signOut(auth);
}