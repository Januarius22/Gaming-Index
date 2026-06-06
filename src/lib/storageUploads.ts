export const KYC_STORAGE_BUCKET = "kyc-documents";
export const MAX_KYC_FILE_BYTES = 20 * 1024 * 1024;
export const IMAGE_KYC_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

type FileLike = {
  name: string;
  size?: number;
  type?: string;
};

function formatAllowedExtensions(allowedExtensions: Set<string>) {
  return Array.from(allowedExtensions)
    .map((value) => value.toUpperCase())
    .join(", ");
}

export function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function getFileExtension(fileName: string) {
  const sanitized = fileName.trim().toLowerCase();
  const segments = sanitized.split(".");

  if (segments.length < 2) {
    return "";
  }

  return segments.at(-1) ?? "";
}

export function inferContentType(file: Pick<FileLike, "name" | "type">) {
  if (file.type) {
    return file.type;
  }

  const extension = getFileExtension(file.name);

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export function validateFileUpload({
  file,
  fieldLabel,
  allowedExtensions,
  maxBytes
}: {
  file: FileLike | null;
  fieldLabel: string;
  allowedExtensions: Set<string>;
  maxBytes: number;
}) {
  if (!file) {
    return `${fieldLabel} is required.`;
  }

  if (typeof file.size === "number" && file.size > maxBytes) {
    return `${fieldLabel} must be ${Math.floor(maxBytes / (1024 * 1024))}MB or smaller.`;
  }

  const extension = getFileExtension(file.name);

  if (!allowedExtensions.has(extension)) {
    return `${fieldLabel} must be a ${formatAllowedExtensions(allowedExtensions)} file.`;
  }

  return "";
}

export function validateUploadedStorageAsset({
  fileName,
  filePath,
  fieldLabel,
  allowedExtensions,
  expectedOwnerId
}: {
  fileName: string;
  filePath: string;
  fieldLabel: string;
  allowedExtensions: Set<string>;
  expectedOwnerId: string;
}) {
  if (!fileName || !filePath) {
    return `${fieldLabel} upload is missing. Please upload it again.`;
  }

  const extension = getFileExtension(fileName);

  if (!allowedExtensions.has(extension)) {
    return `${fieldLabel} must be a ${formatAllowedExtensions(allowedExtensions)} file.`;
  }

  if (!filePath.startsWith(`${expectedOwnerId}/`)) {
    return `${fieldLabel} upload could not be verified. Please upload it again.`;
  }

  return "";
}
