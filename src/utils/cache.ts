import NodeCache from "node-cache";

let MyLinksCache: NodeCache;

async function InitialiseCache() {
  MyLinksCache = new NodeCache();
}

export default async () => {
  if (!MyLinksCache) {
    await InitialiseCache();
  }

  return MyLinksCache;
};
