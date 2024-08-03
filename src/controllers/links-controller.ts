import type { Context } from "hono";
import { createLinkSchema } from "../models/links";
import {
  createLink,
  fetchLink,
  fetchMultipleLinks,
} from "../services/link-service";
import { generateRandomCode } from "../utils/links";
import { BackendError } from "../utils/errors";
import { getConnInfo } from "@hono/node-server/conninfo";
import { getCookie, setCookie } from "hono/cookie";
import cache from "../utils/cache";

export async function handleCreateLink(c: Context) {
  const connInfo = getConnInfo(c);
  const ipAddress = connInfo.remote.address || "::1";
  const myLinksCookie = getCookie(c, "linkIds") || "[]";
  const myLinksArray = JSON.parse(myLinksCookie);
  const reqBody = await c.req.json();
  const { longUrl, customCode } = await createLinkSchema.parseAsync(reqBody);

  let shortCode = customCode ?? generateRandomCode(6);
  let analyticsCode = generateRandomCode(6);
  let linkId = generateRandomCode(12);

  const shortCodeConflict = await fetchLink({
    shortCode,
    linkId,
    analyticsCode,
  });

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

  myLinksArray.push(linkId);
  await createLink(longUrl, shortCode, analyticsCode, linkId, ipAddress);
  (await cache()).set(shortCode, longUrl, 60 * 2);

  // TODO: Add to cookie
  setCookie(c, "linkIds", JSON.stringify(myLinksArray), {
    sameSite: "strict",
    httpOnly: true,
  });
  return c.json({ success: true, message: "Created Successfully" });
}

export async function handleFetchMyLinks(c: Context) {
  const myLinksCookie = getCookie(c, "linkIds") || "[]";
  const myLinksArray = JSON.parse(myLinksCookie);

  if (myLinksArray.length === 0) {
    throw new BackendError("NOT_FOUND", {
      message: "No links found",
      details: "You have not created any links yet",
    });
  }

  const links = await fetchMultipleLinks(myLinksArray);

  return c.json({
    success: true,
    message: links,
  });
}

export async function handleFetchLink(c: Context) {
  const shortCode = c.req.param("shortCode");
  const myLinksCookie = getCookie(c, "linkIds") || "[]";
  const myLinksArray = JSON.parse(myLinksCookie);
  console.log(myLinksArray);

  let redirectUrl = (await cache()).get(shortCode);

  if (!redirectUrl) {
    const link = await fetchLink({
      shortCode,
    });

    if (!link) {
      throw new BackendError("NOT_FOUND", {
        message: "Link not found",
        details: "The link you are trying to access does not exist",
      });
    }

    redirectUrl = link.longUrl;
  }

  return c.json({
    success: true,
    message: redirectUrl,
  });
}
