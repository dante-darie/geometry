import { Figure, Point } from '~abstracts';
import { IBoundingBox, IDimensional, ISize, TCircleValues } from '~types';
import { Calculator } from '~utilities';

export class Circle extends Figure implements IDimensional {
  private _center: Point;
  private _radius: number;
  private _size: ISize;
  private _diameter: number;

  constructor(values: TCircleValues) {
    super();

    const [center, radius] = values;

    this._center = center;
    this._radius = radius;
    this._diameter = +Calculator.mul(radius, 2);
    this._size = { width: this.diameter, height: this.diameter };
    this.points = [center];
    this.isRelative = false;
  }

  get center() {
    return this._center;
  }

  get radius() {
    return this._radius;
  }

  get diameter() {
    return this._diameter;
  }

  get size() {
    return this._size;
  }

  get boundingBox(): IBoundingBox {
    const { center, radius } = this;
    const xMin = +Calculator.sub(center.x, radius);
    const yMin = +Calculator.sub(center.y, radius);
    const xMax = +Calculator.add(center.x, radius);
    const yMax = +Calculator.add(center.y, radius);

    return { xMin, xMax, yMin, yMax };
  }

  get values(): TCircleValues {
    return [this.center, this.radius];
  }

  public scale(factor: number, about: Point = new Point({ x: 0, y: 0 })): this {
    super.scale(factor, about, false);

    const radius = +Calculator.mul(this.radius, factor);

    this._radius = radius;
    this._diameter = +Calculator.mul(radius, 2);
    this._size = { width: this.diameter, height: this.diameter };

    return this;
  }

  public clone(): Circle {
    return new Circle([this.center.clone(), this.radius]);
  }
}
