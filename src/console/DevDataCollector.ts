export default class DevDataCollector {
  private static currentField = '';

  public static getCurrentField(): string {
    return DevDataCollector.currentField;
  }

  public static setCurrentField(fieldHash: string): void {
    DevDataCollector.currentField = fieldHash;
  }
}
