/**
 * Yandex Wordstat API Client
 * API Endpoint: https://api.wordstat.yandex.net
 */

const API_BASE_URL = "https://api.wordstat.yandex.net";

// ============ Types ============

export interface TopRequestsParams {
  phrase: string;
  regions?: number[];
  numPhrases?: number;
}

export interface DynamicsParams {
  phrase: string;
  period: "monthly" | "weekly" | "daily";
  fromDate: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  regions?: number[];
  devices?: "all" | "desktop" | "phone" | "tablet";
}

export interface RegionsParams {
  phrase: string;
}

export interface TopRequestsResponse {
  phrase: string;
  count: number;
  includingPhrases: Array<{
    phrase: string;
    count: number;
  }>;
  similarPhrases: Array<{
    phrase: string;
    count: number;
  }>;
}

export interface DynamicsResponse {
  phrase: string;
  dynamics: Array<{
    date: string;
    count: number;
    share: number;
  }>;
}

export interface RegionsResponse {
  phrase: string;
  regions: Array<{
    regionId: number;
    count: number;
    share: number;
    affinityIndex: number;
  }>;
}

export interface Region {
  id: number;
  name: string;
  parentId?: number;
  children?: Region[];
}

export interface RegionsTreeResponse {
  regions: Region[];
}

export interface UserInfoResponse {
  login: string;
  quotaLimit: number;
  quotaUsed: number;
  quotaRemaining: number;
}

export interface ApiError {
  error: string;
  message: string;
  code?: number;
}

// ============ Client ============

export class WordstatClient {
  private token: string;

  constructor(token: string) {
    if (!token) {
      throw new Error("WORDSTAT_API_TOKEN is required");
    }
    this.token = token;
  }

  private async request<T>(endpoint: string, body?: object): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;

      try {
        const errorJson = JSON.parse(errorText) as ApiError;
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText;
      }

      throw new Error(`Wordstat API error (${response.status}): ${errorMessage}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get top requests and similar phrases for a keyword
   */
  async getTopRequests(params: TopRequestsParams): Promise<TopRequestsResponse> {
    return this.request<TopRequestsResponse>("/v1/topRequests", {
      phrase: params.phrase,
      ...(params.regions && { regions: params.regions }),
      ...(params.numPhrases && { numPhrases: params.numPhrases }),
    });
  }

  /**
   * Get frequency dynamics over time for a keyword
   */
  async getDynamics(params: DynamicsParams): Promise<DynamicsResponse> {
    return this.request<DynamicsResponse>("/v1/dynamics", {
      phrase: params.phrase,
      period: params.period,
      fromDate: params.fromDate,
      ...(params.toDate && { toDate: params.toDate }),
      ...(params.regions && { regions: params.regions }),
      ...(params.devices && { devices: params.devices }),
    });
  }

  /**
   * Get regional distribution for a keyword
   */
  async getRegions(params: RegionsParams): Promise<RegionsResponse> {
    return this.request<RegionsResponse>("/v1/regions", {
      phrase: params.phrase,
    });
  }

  /**
   * Get the tree of all available regions
   * Note: This method doesn't consume the daily quota
   */
  async getRegionsTree(): Promise<RegionsTreeResponse> {
    return this.request<RegionsTreeResponse>("/v1/getRegionsTree");
  }

  /**
   * Get user info and quota status
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>("/v1/userInfo");
  }
}
