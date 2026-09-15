import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAuth} from "firebase-admin/auth";
import {initializeApp} from "firebase-admin/app";

initializeApp();

setGlobalOptions({maxInstances: 10});

export const checkEmailStatus = onCall(
  {
    cors: true,
    invoker: "public",
  },
  async (request) => {
    const email = String(request.data?.email || "").trim().toLowerCase();

    if (!email) {
      throw new HttpsError(
        "invalid-argument",
        "Email is required.",
      );
    }

    try {
      const user = await getAuth().getUserByEmail(email);

      return {
        exists: true,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
      };
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error ?
          String((error as {code?: unknown}).code) :
          "";

      if (code === "auth/user-not-found") {
        return {
          exists: false,
          emailVerified: false,
          disabled: false,
        };
      }

      throw new HttpsError(
        "internal",
        "Unable to check email status.",
      );
    }
  }
);

