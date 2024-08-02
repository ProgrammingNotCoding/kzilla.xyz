import type { LinkSchemaType } from "../models/links";
import db from "../utils/db";
import { BackendError } from "../utils/errors";

export async function fetchLink(
  shortCode: string,
  analyticsCode?: string,
  linkId?: string,
) {
  try {
    const linksCollection = (await db()).collection<LinkSchemaType>("links");

    return await linksCollection.findOne({
      shortCode,
      analyticsCode,
      linkId,
    });
  } catch (err) {
    throw new BackendError("INTERNAL_ERROR", {
      message: "Error while fetch a link",
      details: err,
    });
  }
}

export async function createLink(
  longUrl: string,
  shortCode: string,
  analyticsCode: string,
  linkId: string,
  ipAddress: string,
) {
  try {
    const linksCollection = (await db()).collection<LinkSchemaType>("links");

    return await linksCollection.insertOne({
      linkId,
      longUrl,
      customCode: shortCode,
      analyticsCode,
      clicks: 0,
      creatorIpAddress: ipAddress,
      enabled: true,
      timestamp: new Date(),
      logs: [],
    });
  } catch (err) {
    throw new BackendError("INTERNAL_ERROR", {
      message: "Error while fetch a link",
      details: err,
    });
  }
}
