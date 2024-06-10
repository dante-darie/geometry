import { Decimal } from 'decimal.js';
import { Vector } from '~abstracts';
import { Line } from '~figures';
import { IPositional } from '~types';


export class Point implements IPositional {
  private _x: Decimal;
  private _y: Decimal;

  constructor({ x, y }: { x: Decimal|number, y: Decimal|number }) {
    this._x = x instanceof Decimal ? x : new Decimal(x);
    this._y = y instanceof Decimal ? y : new Decimal(y);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  public translate(vector: Vector) {
    const { x, y } = this;

    this._x = x.add(vector.dx);
    this._y = y.add(vector.dy);

    return this;
  }

  public reflect(about: Point|Line) {
    if (about instanceof Line) {
      const perpendicular = about.getPerpendicularThrough(this);

      about = perpendicular.P1.clone();
    }

    const translationVector = new Vector([this, about]).multiply(2);

    return this.translate(translationVector);
  }

  public rotate(phi: Decimal, about: Point = new Point({ x: 0, y: 0 })) {
    const dx = this.x.sub(about.x);
    const dy = this.y.sub(about.y);
    const sinPhi = phi.sin();
    const cosPhi = phi.cos();

    this._x = dx.mul(cosPhi).sub(dy.mul(sinPhi)).add(about._x);
    this._y = dy.mul(cosPhi).add(dx.mul(sinPhi)).add(about._y);

    return this;
  }

  public clone() {
    const { _x: x, _y: y } = this;

    return new Point({ x, y });
  }
}
