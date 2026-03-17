import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"] as const;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

type AcceptedType = (typeof ACCEPTED_TYPES)[number];

export const fileSchema = z.object({
  name: z.string(),
  size: z
    .number()
    .max(MAX_FILE_SIZE, "File size must be under 10 MB"),
  type: z
    .string()
    .refine(
      (t): t is AcceptedType =>
        ACCEPTED_TYPES.includes(t as AcceptedType),
      "Only PNG and JPG files are accepted"
    ),
});

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

function checkMagicBytes(buffer: ArrayBuffer, expected: number[]): boolean {
  const bytes = new Uint8Array(buffer, 0, expected.length);
  return expected.every((byte, index) => bytes[index] === byte);
}

export async function validateFile(file: File): Promise<ValidationResult> {
  // Schema validation
  const result = fileSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!result.success) {
    const firstError = result.error.issues[0];
    return { valid: false, error: firstError?.message ?? "Invalid file" };
  }

  // Magic byte verification to reject corrupted files
  try {
    const headerSlice = file.slice(0, 8);
    const buffer = await headerSlice.arrayBuffer();

    const isPng = file.type === "image/png" && checkMagicBytes(buffer, PNG_MAGIC);
    const isJpeg =
      (file.type === "image/jpeg" || file.type === "image/jpg") &&
      checkMagicBytes(buffer, JPEG_MAGIC);

    if (!isPng && !isJpeg) {
      return {
        valid: false,
        error: "File appears to be corrupted or has an incorrect extension",
      };
    }
  } catch {
    return { valid: false, error: "Unable to read file. It may be corrupted." };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
