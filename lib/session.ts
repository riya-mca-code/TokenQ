import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";

export function getSessionToken() {
  return cookies().get(AUTH_COOKIE_NAME)?.value || "";
}
