export default class DebugDataCollector {
  private static currentField = '';

  public static getCurrentField(): string {
    return DebugDataCollector.currentField;
  }

  public static setCurrentField(fieldHash: string): void {
    DebugDataCollector.currentField = fieldHash;
  }
}
