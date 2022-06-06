import { Container } from 'pixi.js';

export interface RelativePosition {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export const positionRelative = (
  containerToPosition: Container,
  relativeTo: Container,
  relativePosition: RelativePosition,
) => {
  if (relativePosition.top !== undefined) {
    containerToPosition.position.y =
      relativeTo.position.y + relativePosition.top;
  } else if (relativePosition.bottom !== undefined) {
    containerToPosition.position.y =
      relativeTo.position.y + relativeTo.height + relativePosition.bottom;
  }

  if (relativePosition.left !== undefined) {
    containerToPosition.position.x =
      relativeTo.position.x + relativePosition.left;
  } else if (relativePosition.right !== undefined) {
    containerToPosition.position.x =
      relativeTo.position.x + relativeTo.width + relativePosition.right;
  }
};
