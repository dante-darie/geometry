import { Decimal } from 'decimal.js';
import { Point } from '~abstracts';

export class Vector {
  private _dx: Decimal;
  private _dy: Decimal;

  constructor(parameters: { dx: Decimal|number, dy: Decimal|number } | [Point, Point]) {
    if (Array.isArray(parameters)) {
      const [P1, P2] = parameters;

      this._dx = P2.x.sub(P1.x);
      this._dy = P2.y.sub(P1.y);

      return;
    }

    const { dx, dy } = parameters;

    this._dx = dx instanceof Decimal ? dx : new Decimal(dx);
    this._dy = dy instanceof Decimal ? dy : new Decimal(dy);
  }

  get dx() {
    return this._dx;
  }

  get dy() {
    return this._dy;
  }

  get magnitude(): Decimal {
    return (this._dx.pow(2).add(this._dy.pow(2))).sqrt();
  }

  public clone() {
    const { dx, dy } = this;

    return new Vector({ dx, dy });
  }

  public dotProduct(V2: Vector): Decimal {
    return this.dx.mul(V2.dx).add(this.dy.mul(V2.dy));
  }

  public angleTo(V2: Vector): Decimal {
    const dotProd = this.dotProduct(V2);
    const magV1 = this.magnitude;
    const magV2 = V2.magnitude;

    return (dotProd.div(magV1.mul(magV2))).acos();
  }

  public multiply(factor: Decimal|number): this {
    const { dx, dy } = this;

    this._dx = dx.mul(factor);
    this._dy = dy.mul(factor);

    return this;
  }
}
