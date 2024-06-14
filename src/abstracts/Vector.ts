import { Point } from '~abstracts';
import { Line } from '~figures';
import { IDirectional } from '~types';
import { Calculator } from '~utilities';

export class Vector implements IDirectional {
  private _dx: number;
  private _dy: number;

  constructor(parameters: { dx: number, dy: number } | [Point, Point]) {
    if (Array.isArray(parameters)) {
      const [P1, P2] = parameters;

      this._dx = +Calculator.sub(P2.x, P1.x);
      this._dy = +Calculator.sub(P2.y, P1.y);

      return;
    }

    const { dx, dy } = parameters;

    this._dx = dx;
    this._dy = dy;
  }

  get dx() {
    return this._dx;
  }

  get dy() {
    return this._dy;
  }

  get values() {
    return [this.dx, this.dy];
  }

  get magnitude(): number {
    const { dx, dy } = this;

    return +(Calculator.pow(dx, 2).add(Calculator.pow(dy, 2))).sqrt();
  }

  public clone() {
    const { dx, dy } = this;

    return new Vector({ dx, dy });
  }

  public dotProduct(V2: Vector): number {
    const { dx, dy } = this;

    return +Calculator.mul(dx, V2.dx).add(Calculator.mul(dy, V2.dy));
  }

  public angleTo(V2: Vector): Calculator {
    const dotProd = this.dotProduct(V2);
    const magV1 = this.magnitude;
    const magV2 = V2.magnitude;
    const magProd = Calculator.mul(magV1, magV2);
    const cosAngle = Calculator.div(dotProd, magProd);
    const angle = cosAngle.acos();

    return angle;
  }

  public scale(factor: number|[number, number]): this {
    const { dx, dy } = this;
    const isAsymmetricFactor = Array.isArray(factor);
    const xFactor = isAsymmetricFactor ? factor[0] : factor;
    const yFactor = isAsymmetricFactor ? factor[1] : factor;

    this._dx = +Calculator.mul(dx, xFactor);
    this._dy = +Calculator.mul(dy, yFactor);

    return this;
  }

  public reflect(about: Point|Line) {
    if (about instanceof Line) {
      const angle = about.V.angleTo(this);
      const phi = +Calculator.mul(angle, 2);

      this.rotate(phi);

      return this;
    }

    this._dx = +Calculator.neg(this.dx);
    this._dy = +Calculator.neg(this.dy);

    return this;
  }

  public replace(vector: Vector) {
    this._dx = vector.dx;
    this._dy = vector.dy;

    return this;
  }

  public rotate(phi: number, about: Point = new Point({ x: 0, y: 0 })) {
    const P1 = about.translate(this);
    const rP1 = P1.rotate(phi, about);
    const V1 = new Vector([about, rP1]);

    this.replace(V1);

    return this;
  }
}
