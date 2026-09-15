"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import Image from "next/image";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";
import { uploadProfileImage } from "../../lib/cloudinary";

type LoginSignupModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => Promise<void>;
};

type AuthMode = "login" | "signup";

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a16.7 16.7 0 0 1-3.1 4.4" />
        <path d="M6.6 6.6C3.8 8.3 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 7 10 10" />
      <path d="m17 7-10 10" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <span
      className="
        inline-block
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-[#d8d8d8]
        border-t-[#5424ad]
      "
    />
  );
}

export default function LoginSignupModal({
  open,
  onClose,
  onAuthSuccess,
}: LoginSignupModalProps) {
  const [mode, setMode] = useState<AuthMode>("signup");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [usernameReady, setUsernameReady] = useState(false);
  const [emailReady, setEmailReady] = useState(false);
  const [passwordReady, setPasswordReady] = useState(false);
  const [loginReady, setLoginReady] = useState(false);

  const [usernameAvailable, setUsernameAvailable] =
    useState<boolean | null>(null);

  const [usernameChecking, setUsernameChecking] = useState(false);

  const [usernameManuallyEdited, setUsernameManuallyEdited] =
    useState(false);

  const [visible, setVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const usernameCheckTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const usernameRequestRef = useRef(0);

  const resetState = () => {
    setMode("signup");

    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setLoginIdentifier("");
    setPassword("");

    setProfileImage("");
    setProfileFile(null);

    setShowPassword(false);

    setUsernameReady(false);
    setEmailReady(false);
    setPasswordReady(false);
    setLoginReady(false);

    setUsernameAvailable(null);
    setUsernameChecking(false);
    setUsernameManuallyEdited(false);

    setAuthError("");
    setAuthLoading(false);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        resetState();

        requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (usernameCheckTimerRef.current) {
        clearTimeout(usernameCheckTimerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (authLoading) return;

    setVisible(false);

    window.setTimeout(() => {
      resetState();
      onClose();
    }, 220);
  };

  const switchMode = (newMode: AuthMode) => {
    if (authLoading) return;

    setMode(newMode);

    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setLoginIdentifier("");
    setPassword("");

    setProfileImage("");
    setProfileFile(null);

    setShowPassword(false);

    setUsernameReady(false);
    setEmailReady(false);
    setPasswordReady(false);
    setLoginReady(false);

    setUsernameAvailable(null);
    setUsernameChecking(false);
    setUsernameManuallyEdited(false);

    setAuthError("");
  };

  const normalizeUsername = (value: string) => {
    return value.trim().toLowerCase();
  };

  const createUsernameBase = (
    first: string,
    last: string,
  ) => {
    const cleanFirst = first
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const cleanLast = last
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const base = `${cleanFirst}${cleanLast}`;

    if (base.length >= 3) {
      return base.slice(0, 24);
    }

    return (base || "student").slice(0, 24);
  };

  const checkUsernameAvailability = useCallback(async (
    usernameValue: string,
  ) => {
    const cleanUsername =
      normalizeUsername(usernameValue);

    if (!cleanUsername) {
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }

    if (
      cleanUsername.length < 3 ||
      !/^[a-zA-Z0-9_]+$/.test(cleanUsername)
    ) {
      setUsernameAvailable(false);
      setUsernameChecking(false);
      return;
    }

    const requestId =
      ++usernameRequestRef.current;

    setUsernameChecking(true);
    setUsernameAvailable(null);

    try {
      const usernameRef = doc(
        db,
        "usernames",
        cleanUsername,
      );

      const snapshot = await getDoc(usernameRef);

      if (
        requestId !== usernameRequestRef.current
      ) {
        return;
      }

      setUsernameAvailable(!snapshot.exists());
    } catch (error) {
      console.error(
        "Username availability check failed:",
        error,
      );

      if (
        requestId !== usernameRequestRef.current
      ) {
        return;
      }

      setUsernameAvailable(null);
    } finally {
      if (
        requestId === usernameRequestRef.current
      ) {
        setUsernameChecking(false);
      }
    }
  }, []);

  const scheduleUsernameCheck = useCallback((
    value: string,
  ) => {
    if (usernameCheckTimerRef.current) {
      clearTimeout(usernameCheckTimerRef.current);
    }

    setUsernameAvailable(null);

    const cleanValue =
      normalizeUsername(value);

    if (!cleanValue) {
      setUsernameChecking(false);
      return;
    }

    if (
      cleanValue.length < 3 ||
      !/^[a-zA-Z0-9_]+$/.test(cleanValue)
    ) {
      setUsernameAvailable(false);
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);

    usernameCheckTimerRef.current =
      setTimeout(() => {
        void checkUsernameAvailability(
          cleanValue,
        );
      }, 350);
  }, [checkUsernameAvailability]);

  useEffect(() => {
    if (
      mode !== "signup" ||
      usernameManuallyEdited
    ) {
      return;
    }

    const timer = setTimeout(() => {
      if (!firstName.trim() && !lastName.trim()) {
        setUsername("");
        setUsernameAvailable(null);
        return;
      }

      const base = createUsernameBase(
        firstName,
        lastName,
      );

      setUsername(base);
      scheduleUsernameCheck(base);
    }, 0);

    return () => clearTimeout(timer);
  }, [
    firstName,
    lastName,
    mode,
    usernameManuallyEdited,
    scheduleUsernameCheck,
  ]);

  const handleUsernameChange = (
    value: string,
  ) => {
    const cleaned = value.replace(/\s/g, "");

    setUsernameManuallyEdited(true);
    setUsername(cleaned);
    setAuthError("");

    scheduleUsernameCheck(cleaned);
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAuthError(
        "Please select a valid image.",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAuthError(
        "Profile picture must be smaller than 5 MB.",
      );
      return;
    }

    setProfileFile(file);

    setProfileImage(
      URL.createObjectURL(file),
    );

    setAuthError("");
  };

  const findEmailByUsername = async (
    usernameValue: string,
  ) => {
    const usernameLower =
      normalizeUsername(usernameValue);

    const usernameRef = doc(
      db,
      "usernames",
      usernameLower,
    );

    const snapshot =
      await getDoc(usernameRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data().email ?? null;
  };

  const handleLogin = async () => {
    const identifier =
      loginIdentifier.trim();

    if (!identifier) {
      setAuthError(
        "Please enter your username or email.",
      );
      return;
    }

    if (!password) {
      setAuthError(
        "Please enter your password.",
      );
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      let loginEmail = identifier;

      if (!identifier.includes("@")) {
        const usernameEmail =
          await findEmailByUsername(
            identifier,
          );

        if (!usernameEmail) {
          setAuthError(
            "Username or password is incorrect.",
          );
          return;
        }

        loginEmail = usernameEmail;
      }

      const credential =
        await signInWithEmailAndPassword(
          auth,
          loginEmail.toLowerCase(),
          password,
        );

      await setDoc(
        doc(
          db,
          "users",
          credential.user.uid,
        ),
        {
          lastActiveAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      await onAuthSuccess(
        credential.user,
      );
    } catch (error: unknown) {
      console.error(
        "Login error:",
        error,
      );

      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String(
              (
                error as {
                  code?: unknown;
                }
              ).code,
            )
          : "";

      if (
        code ===
          "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setAuthError(
          "Username/email or password is incorrect.",
        );
      } else if (
        code === "auth/invalid-email"
      ) {
        setAuthError(
          "Please enter a valid email address.",
        );
      } else if (
        code === "auth/too-many-requests"
      ) {
        setAuthError(
          "Too many attempts. Please try again later.",
        );
      } else {
        setAuthError(
          "Login failed. Please try again.",
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async () => {
    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    const cleanUsername =
      username.trim();

    const usernameLower =
      normalizeUsername(username);

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanFirstName) {
      setAuthError(
        "First name is required.",
      );
      return;
    }

    if (!cleanLastName) {
      setAuthError(
        "Last name is required.",
      );
      return;
    }

    if (!cleanUsername) {
      setAuthError(
        "Username is required.",
      );
      return;
    }

    if (
      !/^[a-zA-Z0-9_]+$/.test(
        cleanUsername,
      )
    ) {
      setAuthError(
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    if (cleanUsername.length < 3) {
      setAuthError(
        "Username must be at least 3 characters.",
      );
      return;
    }

    if (!cleanEmail) {
      setAuthError(
        "Email is required.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      setAuthError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!password) {
      setAuthError(
        "Password is required.",
      );
      return;
    }

    if (password.length < 6) {
      setAuthError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      /*
       * FINAL USERNAME AVAILABILITY CHECK
       */
      const usernameRef = doc(
        db,
        "usernames",
        usernameLower,
      );

      const usernameSnapshot =
        await getDoc(usernameRef);

      if (usernameSnapshot.exists()) {
        setUsernameAvailable(false);

        setAuthError(
          "That username is already taken.",
        );

        setAuthLoading(false);
        return;
      }

      /*
       * FIREBASE AUTH
       *
       * Firebase Authentication prevents
       * duplicate email accounts.
       */
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );

      const user = credential.user;

      /*
       * FINAL USERNAME CHECK
       */
      const finalUsernameSnapshot =
        await getDoc(usernameRef);

      if (finalUsernameSnapshot.exists()) {
        await deleteUser(user);

        setUsernameAvailable(false);

        setAuthError(
          "That username was just taken. Please choose another one.",
        );

        return;
      }

      /*
       * PROFILE IMAGE
       */
      let uploadedImage = "";

      if (profileFile) {
        uploadedImage =
          await uploadProfileImage(
            profileFile,
          );
      }

      /*
       * DISPLAY NAME
       */
      const displayName = [
        cleanFirstName,
        cleanLastName,
      ]
        .filter(Boolean)
        .join(" ");

      /*
       * UPDATE FIREBASE AUTH PROFILE
       */
      await updateProfile(user, {
        displayName,
        photoURL:
          uploadedImage || null,
      });

      /*
       * MAIN USER PROFILE
       *
       * users/{uid}
       *
       * ONLY:
       * uid
       * firstName
       * lastName
       * displayName
       * profileImage
       * role
       * status
       * createdAt
       * lastActiveAt
       */
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
        ),
        {
          uid: user.uid,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          displayName,
          profileImage:
            uploadedImage,
          role: "student",
          status: "active",
          createdAt:
            serverTimestamp(),
          lastActiveAt:
            serverTimestamp(),
        },
      );

      /*
       * USERNAME REGISTRY
       *
       * usernames/{usernameLower}
       *
       * Username and email are stored here
       * for username uniqueness and
       * username -> email login lookup.
       */
      await setDoc(
        usernameRef,
        {
          uid: user.uid,
          username: cleanUsername,
          email: cleanEmail,
          createdAt:
            serverTimestamp(),
        },
      );

      await onAuthSuccess(user);
    } catch (error: unknown) {
      console.error(
        "Signup error:",
        error,
      );

      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String(
              (
                error as {
                  code?: unknown;
                }
              ).code,
            )
          : "";

      if (
        code ===
        "auth/email-already-in-use"
      ) {
        setAuthError(
          "An account with this email already exists. Please log in.",
        );
      } else if (
        code === "auth/invalid-email"
      ) {
        setAuthError(
          "Please enter a valid email address.",
        );
      } else if (
        code === "auth/weak-password"
      ) {
        setAuthError(
          "Password must be at least 6 characters.",
        );
      } else if (
        code ===
        "auth/network-request-failed"
      ) {
        setAuthError(
          "Network error. Please check your internet connection.",
        );
      } else if (
        code === "permission-denied" ||
        code ===
          "firestore/permission-denied"
      ) {
        setAuthError(
          "Firestore permission denied. Please check your Firebase rules.",
        );
      } else {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Account creation failed. Please try again.",
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const signupReady =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length >= 3 &&
    usernameAvailable === true &&
    !usernameChecking &&
    email.trim().length > 0 &&
    password.length >= 6;

  if (!open) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/45
        p-3
        sm:p-5
        lg:p-8
        transition-opacity duration-200
        ${
          visible
            ? "opacity-100"
            : "opacity-0"
        }
      `}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div
        className={`
          relative
          flex
          w-full
          max-w-[1180px]
          overflow-hidden
          rounded-[26px]
          border
          border-white/70
          bg-white
          shadow-[0_30px_90px_rgba(0,0,0,0.22)]
          transition-all
          duration-300
          ease-out
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-[0.97] opacity-0"
          }
          h-[min(820px,calc(100vh-48px))]
          min-h-[620px]
        `}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={handleClose}
          disabled={authLoading}
          aria-label="Close"
          className="
            absolute
            right-5
            top-5
            z-30
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[#e7e5e9]
            bg-white
            text-[20px]
            leading-none
            text-[#888]
            shadow-sm
            transition
            hover:border-[#d3d0d7]
            hover:bg-[#f7f6f8]
            hover:text-[#222]
            disabled:opacity-50
          "
        >
          ×
        </button>

        {/* LEFT — PROFILE */}
        <div
          className="
            hidden
            w-[40%]
            shrink-0
            flex-col
            items-center
            justify-center
            border-r
            border-[#eeeaf2]
            bg-[#faf9fc]
            px-8
            lg:flex
            xl:w-[38%]
          "
        >
          <div className="flex w-full max-w-[300px] flex-col items-center text-center">
            <div
              className="
                mb-7
                flex
                h-[190px]
                w-[190px]
                items-center
                justify-center
                rounded-full
                border
                border-[#e7dfef]
                bg-white
                p-2
                shadow-[0_15px_45px_rgba(84,36,173,0.08)]
              "
            >
              <div
                className="
                  relative
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-[#f5f1fa]
                  text-[#9179b3]
                "
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile preview"
                    fill
                    sizes="176px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <CameraIcon />

                    <span className="mt-2 text-[10px] font-medium text-[#a99ab8]">
                      Your photo
                    </span>
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              disabled={authLoading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                rounded-xl
                bg-[#5424ad]
                px-5
                py-2.5
                text-[11px]
                font-semibold
                text-white
                shadow-[0_8px_20px_rgba(84,36,173,0.18)]
                transition
                hover:bg-[#472098]
                disabled:opacity-50
              "
            >
              {profileImage
                ? "Change photo"
                : "Upload photo"}
            </button>

            <h3 className="mt-7 text-[18px] font-bold tracking-[-0.4px] text-[#202020]">
              Create your profile
            </h3>

            <p className="mt-2 max-w-[250px] text-[11px] leading-5 text-[#999]">
              Add a profile picture and your
              basic details to personalize your
              SigmaSprint account.
            </p>

            <div
              className="
                mt-7
                rounded-xl
                border
                border-[#e9e4ef]
                bg-white
                px-4
                py-3
              "
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9a89ad]">
                Profile picture
              </p>

              <p className="mt-1 text-[9px] text-[#aaa]">
                Optional · JPG, PNG or WEBP ·
                Max 5 MB
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
            overflow-y-auto
            bg-white
            px-5
            py-8
            sm:px-9
            sm:py-10
            lg:px-12
            lg:py-12
            xl:px-16
          "
        >
          <div className="mx-auto w-full max-w-[520px]">
            {/* MOBILE PROFILE */}
            {mode === "signup" && (
              <div className="mb-7 flex flex-col items-center lg:hidden">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    relative
                    flex
                    h-[88px]
                    w-[88px]
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    border-2
                    border-[#e5dff0]
                    bg-[#f8f6fb]
                    text-[#9179b3]
                  "
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile preview"
                      fill
                      sizes="88px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <CameraIcon />
                  )}

                  <span
                    className="
                      absolute
                      bottom-0.5
                      right-0.5
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-[#5424ad]
                      text-white
                    "
                  >
                    <CameraIcon />
                  </span>
                </button>

                <p className="mt-2 text-[10px] font-semibold text-[#333]">
                  Profile picture · Optional
                </p>
              </div>
            )}

            {/* HEADING */}
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[#5424ad]
                "
              >
                {mode === "signup"
                  ? "Get started"
                  : "Welcome back"}
              </p>

              <h2
                className="
                  mt-2
                  text-[29px]
                  font-bold
                  tracking-[-1.2px]
                  text-[#171717]
                  sm:text-[34px]
                "
              >
                {mode === "signup"
                  ? "Create your account"
                  : "Sign in to continue"}
              </h2>

              <p className="mt-2 text-[12px] text-[#999]">
                {mode === "signup"
                  ? "Create your account and start your learning journey."
                  : "Enter your details to access your account."}
              </p>
            </div>

            {/* MODE SWITCH */}
            <div
              className="
                mt-6
                grid
                grid-cols-2
                rounded-xl
                border
                border-[#e8e5ed]
                bg-[#faf9fb]
                p-1
              "
            >
              <button
                type="button"
                disabled={authLoading}
                onClick={() =>
                  switchMode("signup")
                }
                className={`
                  h-9
                  rounded-lg
                  text-[11px]
                  font-semibold
                  transition
                  ${
                    mode === "signup"
                      ? "bg-white text-[#5424ad] shadow-sm"
                      : "text-[#999] hover:text-[#555]"
                  }
                `}
              >
                Create Account
              </button>

              <button
                type="button"
                disabled={authLoading}
                onClick={() =>
                  switchMode("login")
                }
                className={`
                  h-9
                  rounded-lg
                  text-[11px]
                  font-semibold
                  transition
                  ${
                    mode === "login"
                      ? "bg-white text-[#5424ad] shadow-sm"
                      : "text-[#999] hover:text-[#555]"
                  }
                `}
              >
                Login
              </button>
            </div>

            {/* SIGNUP */}
            {mode === "signup" && (
              <div className="mt-5">
                {/* FIRST + LAST */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-[#444]">
                      First Name *
                    </label>

                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(
                          event.target.value,
                        )
                      }
                      placeholder="First name"
                      autoComplete="off"
                      disabled={authLoading}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-[#dedede]
                        bg-white
                        px-3
                        text-[12px]
                        text-[#222]
                        outline-none
                        transition
                        placeholder:text-[#aaa]
                        focus:border-[#5424ad]
                        focus:ring-4
                        focus:ring-[#5424ad]/10
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-[#444]">
                      Last Name *
                    </label>

                    <input
                      type="text"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(
                          event.target.value,
                        )
                      }
                      placeholder="Last name"
                      autoComplete="off"
                      disabled={authLoading}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-[#dedede]
                        bg-white
                        px-3
                        text-[12px]
                        text-[#222]
                        outline-none
                        transition
                        placeholder:text-[#aaa]
                        focus:border-[#5424ad]
                        focus:ring-4
                        focus:ring-[#5424ad]/10
                      "
                    />
                  </div>
                </div>

                {/* USERNAME */}
                <div className="mt-3">
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#444]">
                    Username *
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      value={username}
                      onChange={(event) =>
                        handleUsernameChange(
                          event.target.value,
                        )
                      }
                      onFocus={() =>
                        setUsernameReady(true)
                      }
                      readOnly={!usernameReady}
                      placeholder="Choose a unique username"
                      name="account-username"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={authLoading}
                      className={`
                        h-11
                        w-full
                        rounded-xl
                        border
                        bg-white
                        pl-10
                        pr-11
                        text-[12px]
                        text-[#222]
                        outline-none
                        transition
                        placeholder:text-[#aaa]
                        focus:ring-4
                        ${
                          usernameAvailable ===
                          true
                            ? "border-green-400 focus:border-green-500 focus:ring-green-500/10"
                            : usernameAvailable ===
                                false
                              ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                              : "border-[#dedede] focus:border-[#5424ad] focus:ring-[#5424ad]/10"
                        }
                      `}
                    />

                    <span
                      className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        -translate-y-1/2
                        items-center
                        justify-center
                      "
                    >
                      {usernameChecking ? (
                        <LoadingIcon />
                      ) : usernameAvailable ===
                        true ? (
                        <span className="text-green-500">
                          <CheckIcon />
                        </span>
                      ) : usernameAvailable ===
                        false ? (
                        <span className="text-red-500">
                          <CrossIcon />
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <div className="mt-1 flex min-h-[14px] items-center justify-between">
                    <p
                      className={`
                        text-[8px]
                        ${
                          usernameAvailable ===
                          true
                            ? "text-green-600"
                            : usernameAvailable ===
                                false
                              ? "text-red-500"
                              : "text-[#aaa]"
                        }
                      `}
                    >
                      {usernameChecking
                        ? "Checking availability..."
                        : usernameAvailable ===
                            true
                          ? "Username available"
                          : usernameAvailable ===
                              false
                            ? username.length <
                              3
                              ? "Username must be at least 3 characters."
                              : "Username already taken"
                            : "Letters, numbers and underscores only."}
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="mt-3">
                  <label className="mb-1.5 block text-[10px] font-semibold text-[#444]">
                    Email *
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                      <MailIcon />
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value,
                        )
                      }
                      onFocus={() =>
                        setEmailReady(true)
                      }
                      readOnly={!emailReady}
                      placeholder="you@example.com"
                      name="account-email"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={authLoading}
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-[#dedede]
                        bg-white
                        pl-10
                        pr-3
                        text-[12px]
                        text-[#222]
                        outline-none
                        transition
                        placeholder:text-[#aaa]
                        focus:border-[#5424ad]
                        focus:ring-4
                        focus:ring-[#5424ad]/10
                      "
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LOGIN */}
            {mode === "login" && (
              <div className="mt-6">
                <label className="mb-1.5 block text-[10px] font-semibold text-[#444]">
                  Username or Email
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                    <UserIcon />
                  </span>

                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(event) =>
                      setLoginIdentifier(
                        event.target.value,
                      )
                    }
                    onFocus={() =>
                      setLoginReady(true)
                    }
                    readOnly={!loginReady}
                    placeholder="Username or email"
                    name="account-login-id"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={authLoading}
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-[#dedede]
                      bg-white
                      pl-10
                      pr-3
                      text-[12px]
                      text-[#222]
                      outline-none
                      transition
                      placeholder:text-[#aaa]
                      focus:border-[#5424ad]
                      focus:ring-4
                      focus:ring-[#5424ad]/10
                    "
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            <div className="mt-3">
              <label className="mb-1.5 block text-[10px] font-semibold text-[#444]">
                Password *
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                  <LockIcon />
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  onFocus={() =>
                    setPasswordReady(true)
                  }
                  readOnly={!passwordReady}
                  placeholder="Enter your password"
                  name="account-password"
                  autoComplete="new-password"
                  disabled={authLoading}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      if (mode === "login") {
                        void handleLogin();
                      } else if (
                        signupReady
                      ) {
                        void handleSignup();
                      }
                    }
                  }}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[#dedede]
                    bg-white
                    pl-10
                    pr-11
                    text-[12px]
                    text-[#222]
                    outline-none
                    transition
                    placeholder:text-[#aaa]
                    focus:border-[#5424ad]
                    focus:ring-4
                    focus:ring-[#5424ad]/10
                  "
                />

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    p-1.5
                    text-[#999]
                    hover:bg-[#f5f5f5]
                    hover:text-[#5424ad]
                  "
                >
                  <EyeIcon
                    hidden={!showPassword}
                  />
                </button>
              </div>
            </div>

            {/* ERROR */}
            {authError && (
              <div
                className="
                  mt-3
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-3
                  py-2.5
                  text-[10px]
                  leading-4
                  text-red-600
                "
              >
                {authError}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="button"
              disabled={
                authLoading ||
                (mode === "signup" &&
                  !signupReady)
              }
              onClick={() =>
                void (
                  mode === "login"
                    ? handleLogin()
                    : handleSignup()
                )
              }
              className="
                group
                mt-5
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#5424ad]
                text-[12px]
                font-semibold
                text-white
                shadow-[0_8px_24px_rgba(84,36,173,0.18)]
                transition
                hover:bg-[#472098]
                hover:shadow-[0_10px_28px_rgba(84,36,173,0.25)]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {authLoading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create Account"
                  : "Login"}

              {!authLoading && (
                <span className="transition-transform group-hover:translate-x-0.5">
                  <ArrowIcon />
                </span>
              )}
            </button>

            {/* SWITCH */}
            <p className="mt-4 text-center text-[10px] text-[#999]">
              {mode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                disabled={authLoading}
                onClick={() =>
                  switchMode(
                    mode === "signup"
                      ? "login"
                      : "signup",
                  )
                }
                className="font-semibold text-[#5424ad] hover:underline"
              >
                {mode === "signup"
                  ? "Login"
                  : "Create account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}