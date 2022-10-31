import { Container } from '@pixi/display';

export default class DOMLinkedContainer extends Container {
  // in milliseconds
  private static UPDATE_DEBOUNCE_TIMEOUT = 20;

  private lastPositionUpdate = 0;

  private element: HTMLElement;

  constructor(element: HTMLElement) {
    super();

    this.element = element;
    this.update(true);
  }

  public setDOMDimensions(width: number, height: number) {
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
  }

  public update(force = false): void {
    const now = Date.now();

    if (
      force ||
      now - this.lastPositionUpdate >=
        DOMLinkedContainer.UPDATE_DEBOUNCE_TIMEOUT
    ) {
      const bounds = this.element.getBoundingClientRect();

      this.position.set(Math.ceil(bounds.x), Math.ceil(bounds.y));

      this.lastPositionUpdate = now;
    }
  }
}
