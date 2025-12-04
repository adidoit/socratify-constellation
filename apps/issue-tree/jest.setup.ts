import "@testing-library/jest-dom";

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
    scan: jest.fn().mockResolvedValue([0, []]),
  })),
}));

class MockResponse {
  private body: string;
  public status: number;
  public headers: Headers;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = typeof body === "string" ? body : JSON.stringify(body) || "";
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }

  static json(data: unknown, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init?.headers).entries()),
        "Content-Type": "application/json",
      },
    });
  }
}

global.Response = MockResponse as unknown as typeof Response;
