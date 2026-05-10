export interface JaxEntry {
  name: string;
  path: string;
  mime_type: string;
}

export interface JaxListResponse {
  path: string;
  entries: JaxEntry[];
}

export interface JaxClientConfig {
  gateway: string;
  bucketId: string;
  version?: string;
}
