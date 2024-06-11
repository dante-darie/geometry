import { Decimal } from 'decimal.js';
import { Point, Vector } from '~abstracts';
import { Line } from '~figures';

interface IBoundingBox {
  xMin: Decimal,
  xMax: Decimal,
  yMin: Decimal,
  yMax: Decimal
}

interface ISize {
  width: Decimal,
  height: Decimal
}

interface IPositional {
  translate(vector: Vector): void,
  reflect(about: Point|Line): void,
  rotate(phi: Decimal, about?: Point): void,
  clone(): unknown,
  readonly values: (Point|Vector|Decimal|boolean)[]
}

interface IDimensional extends IPositional {
  recompute(): void,
  boundingBox: IBoundingBox
}

export {
  IPositional,
  IDimensional,
  IBoundingBox,
  ISize
};
