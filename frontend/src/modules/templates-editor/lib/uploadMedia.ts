const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type UploadResult = {
  url: string;
  localOnly: boolean;
};

export async function uploadMediaFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${apiBaseUrl}/api/media/upload`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (response.ok) {
      const payload = (await response.json()) as { url: string };
      return { url: payload.url, localOnly: false };
    }
  } catch {
    // Fall through to local preview when the API is unreachable.
  }

  return { url: URL.createObjectURL(file), localOnly: true };
}
