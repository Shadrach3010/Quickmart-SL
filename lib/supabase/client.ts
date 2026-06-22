import { getPublicEnv } from "@/lib/env";

export interface SupabaseRequestOptions extends RequestInit {
  accessToken?: string;
}

export class SupabaseClient {
  constructor(
    private readonly url: string,
    private readonly apiKey: string,
  ) {}

  async request<T>(
    path: string,
    options: SupabaseRequestOptions = {},
  ): Promise<T> {
    const { accessToken, headers, ...init } = options;
    const hasNativeContentType =
      init.body instanceof FormData ||
      init.body instanceof Blob ||
      init.body instanceof ArrayBuffer;
    const response = await fetch(new URL(path, this.url), {
      ...init,
      headers: {
        apikey: this.apiKey,
        Authorization: `Bearer ${accessToken ?? this.apiKey}`,
        ...(!hasNativeContentType && { "Content-Type": "application/json" }),
        ...headers,
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Supabase request failed with status ${response.status}: ${details}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const body = await response.text();
    if (!body) {
      return undefined as T;
    }

    return JSON.parse(body) as T;
  }

  storageUrl(bucket: string, objectPath: string): string {
    const encodedPath = objectPath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    return new URL(
      `/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`,
      this.url,
    ).toString();
  }
}

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const env = getPublicEnv();
    browserClient = new SupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return browserClient;
}
