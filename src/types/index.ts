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

interface ITranslatable {
  translate(vector: Vector): void,
  transpose(vector: Vector): void
}

interface IPositional {
  translate(vector: Vector): void,
  reflect(about: Point|Line): void,
  rotate(phi: Decimal, about?: Point): void,
  clone(): unknown
}

interface IDimensional extends IPositional {
  recompute(): void,
  values: (Point|Vector|Decimal|boolean)[],
  boundingBox: IBoundingBox
}

export {
  IPositional,
  IDimensional,
  ITranslatable,
  IBoundingBox,
  ISize
};
