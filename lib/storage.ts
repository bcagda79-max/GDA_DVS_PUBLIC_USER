import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

const uploadsRoot = path.join(process.cwd(), "uploads");
const documentsRoot = path.join(uploadsRoot, "documents");

const ensureDirectories = async () => {
  if (!fs.existsSync(documentsRoot)) {
    await fsPromises.mkdir(documentsRoot, { recursive: true });
  }
};

export const normalizeStoragePath = (storagePath: string) => {
  const normalized = storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const safe = path.normalize(normalized);
  const resolved = path.join(documentsRoot, safe);
  if (!resolved.startsWith(documentsRoot)) {
    throw new Error("Invalid storage path.");
  }
  return resolved;
};

export const saveDocumentFile = async (
  storagePath: string,
  buffer: Uint8Array | Buffer,
) => {
  await ensureDirectories();
  const filePath = normalizeStoragePath(storagePath);
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, Buffer.from(buffer));
  return filePath;
};

export const deleteDocumentFile = async (storagePath: string) => {
  const filePath = normalizeStoragePath(storagePath);
  if (await fsPromises.stat(filePath).then(() => true).catch(() => false)) {
    await fsPromises.unlink(filePath);
  }
};

export const readDocumentFile = async (storagePath: string) => {
  const filePath = normalizeStoragePath(storagePath);
  return fsPromises.readFile(filePath);
};

export const getDocumentFileUrl = (storagePath: string) => {
  return `/api/files?path=${encodeURIComponent(storagePath)}`;
};
