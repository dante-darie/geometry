import { Figure } from '~abstracts';
import { IDimensional, ISize, TPolygonValues } from '~types';
import { Calculator } from '~utilities';

export class Polygon extends Figure implements IDimensional {
  private _size: ISize;

  constructor(values: TPolygonValues) {
    super();

    this.points = values;

    const { boundingBox } = this;
    const { xMax, xMin, yMax, yMin } = boundingBox;

    this._size = {
      width: +Calculator.sub(xMax, xMin),
      height: +Calculator.sub(yMax, yMin)
    };
    this.isRelative = false;
  }

  get values(): TPolygonValues {
    return this.points as TPolygonValues;
  }

  get size() {
    return this._size;
  }

  get sides() {
    return this.points.length;
  }

  clone(): Polygon {
    const values = this.points.map(point => point.clone());

    return new Polygon(values as TPolygonValues);
  }
}
