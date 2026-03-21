export class LTPStore {
  private readonly values = new Map<string, number>();

  public get(key: string): number | undefined {
    return this.values.get(key);
  }

  public set(key: string, value: number): void {
    this.values.set(key, value);
  }

  public delete(key: string): void {
    this.values.delete(key);
  }

  public clear(): void {
    this.values.clear();
  }
}
