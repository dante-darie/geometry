import { Point, Vector } from '.';
import { Line } from '~figures';
import { IBoundingBox, IComplex } from '~types';
import { Calculator } from '~utilities';

export abstract class Figure {
  protected points: Point[] = [];
  protected vectors: Vector[] = [];
  protected isRelative: boolean = false;

  get boundingBox(): IBoundingBox {
    const { points } = this;
    const [xValues, yValues] = points.reduce((values, point) => {
      values[0].push(point.x);
      values[1].push(point.y);

      return values;
    }, [[], []] as [number[], number[]]);
    const xMax = +Calculator.max(xValues);
    const xMin = +Calculator.min(xValues);
    const yMax = +Calculator.max(yValues);
    const yMin = +Calculator.min(yValues);

    return { xMax, xMin, yMax, yMin };
  }

  public translate(vector: Vector): this {
    this.points.forEach((point) => {
      point.translate(vector);
    });

    this._recompute();

    return this;
  }

  public reflect(about: Point|Line): this {
    this.points.forEach((point) => {
      point.reflect(about);
    });

    this.vectors = this.vectors.map((vector) => {
      const absolutePoint = this.points[0].clone();
      const relativePoint = absolutePoint.clone().translate(vector);
      const absoluteReflection = absolutePoint.reflect(about);
      const relativeReflection = relativePoint.reflect(about);

      return new Vector([absoluteReflection, relativeReflection]);
    });

    this._recompute();

    return this;
  }

  public rotate(phi: number, about?: Point): this {
    this.points.forEach((point) => {
      point.rotate(phi, about);
    });

    this.vectors = this.vectors.map((vector) => {
      const absolutePoint = this.points[0].clone();
      const relativePoint = absolutePoint.clone().translate(vector);
      const absoluteReflection = absolutePoint.rotate(phi, about);
      const relativeReflection = relativePoint.rotate(phi, about);

      return new Vector([absoluteReflection, relativeReflection]);
    });

    this._recompute();

    return this;
  }

  public scale(factor: number, about: Point = new Point({ x: 0, y: 0 }), recompute: boolean = true): this {

    this.points.forEach((point) => {
      const positionalVector = new Vector([about, point]);
      const scaledPositionalVector = positionalVector.clone().scale(factor);
      const scaledPoint = about.clone().translate(scaledPositionalVector);

      point.replace(scaledPoint);
    });

    this.vectors.forEach((vector) => vector.scale(factor));

    recompute && this._recompute();

    return this;
  }

  private _recompute() {
    if ('recompute' in this) {
      (this as unknown as IComplex).recompute();
    }
  }
}
