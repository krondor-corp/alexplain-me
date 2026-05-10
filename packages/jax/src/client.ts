import type { JaxClientConfig, JaxListResponse } from "./types";

export class JaxClient {
  private gateway: string;
  private bucketId: string;
  private version?: string;

  constructor(config: JaxClientConfig) {
    this.gateway = config.gateway.replace(/\/$/, "");
    this.bucketId = config.bucketId;
    this.version = config.version;
  }

  private baseUrl(): string {
    return `${this.gateway}/gw/${this.bucketId}`;
  }

  private withVersion(url: string): string {
    if (!this.version) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}at=${this.version}`;
  }

  async list(
    path = "/",
    options?: { deep?: boolean },
  ): Promise<JaxListResponse> {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    let url = `${this.baseUrl()}${cleanPath}?viewer=false`;
    if (options?.deep) {
      url += "&deep=true";
    }
    url = this.withVersion(url);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`JAX list ${path} failed: ${res.status}`);
    }
    return res.json();
  }

  fileUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return this.withVersion(`${this.baseUrl()}${cleanPath}`);
  }

  rawFileUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return this.withVersion(`${this.baseUrl()}${cleanPath}?viewer=false`);
  }
}
