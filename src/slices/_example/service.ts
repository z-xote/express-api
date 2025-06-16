// src/slices/_example/service.ts
export class ExampleService {
  async getData() {
    return { timestamp: new Date().toISOString() };
  }
}