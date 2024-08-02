import type { Context } from "hono";
import { createLinkSchema } from "../models/links";
import { createLink, fetchLink } from "../services/link-service";
import { generateRandomCode } from "../utils/links";
import { BackendError } from "../utils/errors";
import { getConnInfo } from "@hono/node-server/conninfo";

/**
@summary Validates the request body and creates a new link
*/
export async function handleCreateLink(c: Context) {
  const ipAddress = getConnInfo(c).remote.address || "::1";
  const reqBody = await c.req.json();
  const { longUrl, customCode } = await createLinkSchema.parseAsync(reqBody);

  let shortCode = customCode ?? generateRandomCode(6);
  let analyticsCode = generateRandomCode(6);
  let linkId = generateRandomCode(12);

  const shortCodeConflict = await fetchLink(shortCode, analyticsCode, linkId);

  if (shortCodeConflict) {
    if (customCode && shortCodeConflict.customCode === customCode) {
      throw new BackendError("CONFLICT", {
        message: "CUSTOM_CODE_CONFLICT",
        details: "The custom url you provided already exists",
      });
    }

    // TODO: possiblity of bad practice here... check later
    console.log("DEBUG: Conflicts occured, retrying");
    shortCode = generateRandomCode(6);
    analyticsCode = generateRandomCode(6);
    linkId = generateRandomCode(12);
  }

  await createLink(longUrl, shortCode, analyticsCode, linkId, ipAddress);

  return c.json({ success: true, message: "Created Successfully" });
}
