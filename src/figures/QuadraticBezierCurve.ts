import { Decimal } from 'decimal.js';
import { Figure, Point, Vector } from '~abstracts';
import { IDimensional } from '~types';

type TAxis = 'x'|'y';
type TAxii = ['x', 'y'];
type TAbsoluteValues = [Point, Point, Point];
type TRelativeValues = [Point, Vector, Vector];
type TValues = TAbsoluteValues|TRelativeValues;

export class QuadraticBezierCurve extends Figure implements IDimensional {
  private _P0: Point;
  private _P1: Point;
  private _P2: Point;
  private _V1: Vector;
  private _V2: Vector;
  private _criticalPoint: Point|undefined;

  constructor(values: TValues) {
    super();

    const [firstControl, secondControl, thirdControl] = values;
    const secondControlIsVector = secondControl instanceof Vector;
    const thirdControlIsVector = thirdControl instanceof Vector;

    this.isRelative = secondControlIsVector || thirdControlIsVector;
    this._P0 = firstControl;
    this._P1 = !secondControlIsVector ? secondControl : firstControl.clone().translate(secondControl);
    this._P2 = !thirdControlIsVector ? thirdControl : firstControl.clone().translate(thirdControl);
    this._V1 = secondControlIsVector ? secondControl : new Vector([firstControl, secondControl]);
    this._V2 = thirdControlIsVector ? thirdControl : new Vector([firstControl, thirdControl]);
    this._criticalPoint = this.computeCriticalPoint();

    this.points = [this.P0, this.P1, this.P2];
    this.vectors = [this.V1, this.V2];
  }

  get P0() {
    return this._P0;
  }

  get P1() {
    return this._P1;
  }

  get P2() {
    return this._P2;
  }

  get V1() {
    return this._V1;
  }

  get V2() {
    return this._V2;
  }

  get criticalPoint() {
    return this._criticalPoint;
  }

  get values(): TValues {
    const { P0, P1, P2, V1, V2 } = this;

    if (!this.isRelative) {
      return [P0, P1, P2];
    }

    return [P0, V1, V2];
  }

  public clone() {
    const values = this.values.map((value) => value.clone());

    return new QuadraticBezierCurve(values as TValues);
  }

  public recompute(): void {
    this._criticalPoint = this.computeCriticalPoint();
  }

  private computeCriticalPoint(): Point|undefined {
    const t = this.getCriticalPointTValue();

    if (typeof t === 'undefined') {
      return;
    }

    return this.getPointAtParameter(t);
  }

  private getCriticalPointTValue(): Decimal|undefined {
    const axii: TAxii = ['x', 'y'];
    const { _P0, _P1, _P2 } = this;

    let value;
    for (let i = 0; i < axii.length; i++) {
      const axis = axii[i];

      value = _P0[axis].sub(_P1[axis]).div(
        _P0[axis].sub(_P1[axis].mul(2)).add(_P2[axis])
      );

      if (value.greaterThanOrEqualTo(0) && value.lessThanOrEqualTo(1)) {
        break;
      }
    }

    return value;
  }

  private getPointAtParameter(t: Decimal): Point|undefined {
    const x = this.getCoordinateAtParameter(t, 'x');
    const y = this.getCoordinateAtParameter(t, 'y');

    if (typeof x === 'undefined' || typeof y === 'undefined') {
      return;
    }

    return new Point({ x, y });
  }

  private getCoordinateAtParameter(t: Decimal, axis: TAxis): Decimal|undefined {
    const { _P0, _P1, _P2 } = this;

    const coordinate = Decimal.sub(1, t).pow(2).mul(_P0[axis])
      .add(Decimal.sub(1, t).mul(2).mul(t).mul(_P1[axis]))
      .add(t.pow(2).mul(_P2[axis]));

    if (coordinate.isNaN()) {
      return;
    }

    return coordinate;
  }
}
