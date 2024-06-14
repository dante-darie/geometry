import { Figure, Point } from '~abstracts';
import { IBoundingBox, IDimensional, ISize, TEllipseValues } from '~types';
import { Calculator } from '~utilities';

export class Ellipse extends Figure implements IDimensional {
  private _center: Point;
  private _rx: number;
  private _ry: number;
  private _size: ISize;

  constructor(values: TEllipseValues) {
    super();

    const [center, rx, ry] = values;

    this._center = center;
    this._rx = rx;
    this._ry = ry;
    this._size = {
      width: +Calculator.mul(rx, 2),
      height: +Calculator.mul(ry, 2)
    };
    this.points = [center];
    this.isRelative = false;
  }

  get center() {
    return this._center;
  }

  get rx() {
    return this._rx;
  }

  get ry() {
    return this._ry;
  }

  get size() {
    return this._size;
  }

  get boundingBox(): IBoundingBox {
    const { center, rx, ry } = this;
    const xMin = +Calculator.sub(center.x, rx);
    const yMin = +Calculator.sub(center.y, ry);
    const xMax = +Calculator.add(center.x, rx);
    const yMax = +Calculator.add(center.y, ry);

    return { xMin, xMax, yMin, yMax };
  }

  get values(): TEllipseValues {
    return [this.center, this.rx, this.ry];
  }

  public scale(factor: number, about: Point = new Point({ x: 0, y: 0 })): this {
    super.scale(factor, about, false);

    this._rx = +Calculator.mul(this.rx, factor);
    this._ry = +Calculator.mul(this.ry, factor);

    return this;
  }

  public clone(): Ellipse {
    return new Ellipse([this.center.clone(), this.rx, this.ry]);
  }
}
