import { Figure, Point, Vector } from '~abstracts';
import { IComplex, IDimensional, TAxii, TAxis, TQuadraticValues } from '~types';
import { Calculator } from '~utilities';

export class QuadraticBezierCurve extends Figure implements IDimensional, IComplex {
  private _P0: Point;
  private _P1: Point;
  private _P2: Point;
  private _V1: Vector;
  private _V2: Vector;
  private _criticalPoint: Point|undefined;

  constructor(values: TQuadraticValues) {
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

  get values(): TQuadraticValues {
    const { P0, P1, P2, V1, V2 } = this;

    if (!this.isRelative) {
      return [P0, P1, P2];
    }

    return [P0, V1, V2];
  }

  public clone() {
    const values = this.values.map((value) => value.clone());

    return new QuadraticBezierCurve(values as TQuadraticValues);
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

  private getCriticalPointTValue(): Calculator|undefined {
    const axii: TAxii = ['x', 'y'];
    const { _P0, _P1, _P2 } = this;

    let value;
    for (let i = 0; i < axii.length; i++) {
      const axis = axii[i];

      value = Calculator.sub(_P0[axis], _P1[axis]).div(
        Calculator.sub(_P0[axis], Calculator.mul(_P1[axis], 2)).add(_P2[axis])
      );

      if (+value >= 0 && +value <= 1) {
        break;
      }
    }

    return value;
  }

  private getPointAtParameter(t: Calculator): Point|undefined {
    const x = this.getCoordinateAtParameter(t, 'x');
    const y = this.getCoordinateAtParameter(t, 'y');

    if (typeof x === 'undefined' || typeof y === 'undefined') {
      return;
    }

    return new Point({ x: +x, y: +y });
  }

  private getCoordinateAtParameter(t: Calculator, axis: TAxis): Calculator|undefined {
    const { _P0, _P1, _P2 } = this;

    const coordinate = Calculator.sub(1, t).pow(2).mul(_P0[axis])
      .add(Calculator.sub(1, t).mul(2).mul(t).mul(_P1[axis]))
      .add(t.pow(2).mul(_P2[axis]));

    if (coordinate.isFinite()) {
      return coordinate;
    }
  }
}
