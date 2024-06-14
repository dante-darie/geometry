import { Vector } from '~abstracts';
import { Line } from '~figures';
import { IPositional } from '~types';
import { Calculator } from '~utilities';


export class Point implements IPositional {
  private _x: number;
  private _y: number;

  constructor({ x, y }: { x: number, y: number }) {
    this._x = x;
    this._y = y;
  }

  get x() {
    return +this._x;
  }

  get y() {
    return +this._y;
  }

  get values() {
    return [this.x, this.y];
  }

  public translate(vector: Vector) {
    const { x, y } = this;

    this._x = +Calculator.add(x, vector.dx);
    this._y = +Calculator.add(y, vector.dy);

    return this;
  }

  public reflect(about: Point|Line) {
    if (about instanceof Line) {
      const perpendicular = about.getPerpendicularThrough(this);

      about = perpendicular.P1.clone();
    }

    const translationVector = new Vector([this, about]).scale(2);

    return this.translate(translationVector);
  }

  public rotate(phi: number, about: Point = new Point({ x: 0, y: 0 })) {
    const dx = Calculator.sub(this.x, about.x);
    const dy = Calculator.sub(this.y, about.y);
    const sinPhi = Calculator.sin(phi);
    const cosPhi = Calculator.cos(phi);

    this._x = +dx.mul(cosPhi).sub(dy.mul(sinPhi)).add(about.x);
    this._y = +dy.mul(cosPhi).add(dx.mul(sinPhi)).add(about.y);

    return this;
  }

  public clone() {
    const { x, y } = this;

    return new Point({ x, y });
  }

  public replace(point: Point) {
    this._x = point.x;
    this._y = point.y;

    return this;
  }
}
