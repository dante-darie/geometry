import { Figure, Point, Vector } from '~abstracts';
import { IComplex, IDimensional, TLineValues } from '~types';
import { Calculator } from '~utilities';

export class Line extends Figure implements IDimensional, IComplex {
  private _P0: Point;
  private _P1: Point;
  private _V: Vector;
  private slope: number|undefined;
  private reciprocal: number|undefined;
  private yIntercept: number|undefined;
  private xIntercept: number|undefined;

  constructor(values: TLineValues) {
    super();

    const [P0, anchor] = values;

    if (anchor instanceof Vector) {
      this.isRelative = true;
      this._V = anchor;
      this._P1 = new Point({
        x: +Calculator.add(P0.x, anchor.dx),
        y: +Calculator.add(P0.y, anchor.dy)
      });
    } else { // anchor instanceof Point
      this._P1 = anchor;
      this._V = new Vector({
        dx: +Calculator.sub(anchor.x, P0.x),
        dy: +Calculator.sub(anchor.y, P0.y),
      });
    }

    this._P0 = P0;
    this.slope = this.computeSlope();
    this.yIntercept = this.computeYIntercept();
    this.reciprocal = this.computeReciprocal();
    this.xIntercept = this.computeXIntercept();
    this.points = [this.P0, this.P1];
    this.vectors = [this.V];
  }

  get P0() {
    return this._P0;
  }

  get P1() {
    return this._P1;
  }

  get V() {
    return this._V;
  }

  get values(): TLineValues {
    if (!this.isRelative) {
      return [this.P0, this.P1];
    }

    return [this.P0, this.V];
  }

  get isHorizontal() {
    const { slope, isVertical } = this;

    return !isVertical && slope === 0;
  }

  get isVertical() {
    const { slope } = this;

    return typeof slope === 'undefined';
  }

  get a() {
    const { slope, isVertical, isHorizontal } = this;

    if (isHorizontal) {
      return 1;
    }

    if (isVertical) {
      return 0;
    }

    return slope!;
  }

  get b() {
    const { isVertical, isHorizontal } = this;

    if (isHorizontal || isVertical) {
      return 1;
    }

    return -1;
  }

  get c() {
    const { isVertical, isHorizontal, yIntercept, xIntercept } = this;

    if (isHorizontal) {
      return +Calculator.neg(yIntercept!);
    }

    if (isVertical) {
      return +Calculator.neg(xIntercept!);
    }

    return yIntercept!;
  }

  public clone() {
    const values = this.values.map((value) => value.clone());

    return new Line(values as TLineValues);
  }

  public getPointAtParameter(t: number): Point {
    const { P0, V } = this;

    return new Point({
      x: +Calculator.add(P0.x, Calculator.mul(V.dx, t)),
      y: +Calculator.add(P0.y, Calculator.mul(V.dy, t))
    });
  }

  public getYValueAtX(x: number): number|undefined {
    const { slope, yIntercept } = this;

    if (typeof slope === 'undefined') {
      return;
    }

    if (typeof yIntercept === 'undefined') {
      return +Calculator.mul(slope, x);
    }

    return +Calculator.mul(slope, x).add(yIntercept);
  }

  public getXValueAtY(y: number): number|undefined {
    const { reciprocal, xIntercept } = this;

    if (typeof reciprocal === 'undefined') {
      return;
    }

    if (typeof xIntercept === 'undefined') {
      return +Calculator.mul(reciprocal, y);
    }

    return +Calculator.mul(reciprocal, y).add(xIntercept);
  }

  public getPerpendicularThrough(I: Point): Line {
    if (this.hasPoint(I)) {
      const phi = +Calculator.div(Math.PI, 2);

      return this.clone().rotate(phi, I);
    }

    return new Line([I, this.getPerpendicularProjection(I)]);
  }

  public getPerpendicularProjection(I: Point) {
    const { P0, slope, isVertical, isHorizontal } = this;
    let perpendicularProjection: Point;

    if (this.hasPoint(I)) {
      return I.clone();
    }

    if (isVertical) {
      perpendicularProjection = new Point({ x: P0.x, y: I.y });
    } else if (isHorizontal) {
      perpendicularProjection = new Point({ x: I.x, y: P0.y });
    } else {
      const randomX = new Calculator(1);
      perpendicularProjection = new Point({
        x: +randomX,
        y: +randomX.mul(1).div(slope!).neg().add(Calculator.div(I.x, slope!)).add(I.y)
      });
    }

    return perpendicularProjection;
  }

  public getIntersectionPoint(line: Line): Point|undefined {
    if (this.isParallelTo(line)) {
      return;
    }

    const denominator = Calculator.mul(this.a, line.b).sub(Calculator.mul(line.a, this.b));
    const x = +Calculator.mul(this.b, line.c).sub(Calculator.mul(line.b, this.c)).div(denominator);
    const y = +Calculator.mul(this.c, line.a).sub(Calculator.mul(line.c, this.a)).div(denominator);

    return new Point({ x, y });
  }

  public recompute(): void {
    this.slope = this.computeSlope();
    this.yIntercept = this.computeYIntercept();
    this.reciprocal = this.computeReciprocal();
    this.xIntercept = this.computeXIntercept();
  }

  public angleTo(line: Line): number {
    if (this.isParallelTo(line)) {
      return 0;
    }

    if (this.isPerpendicularTo(line)) {
      return +Calculator.div(Math.PI, 2);
    }

    const thisSlope = new Calculator(this.slope!);
    const lineSlope = new Calculator(line.slope!);

    return +lineSlope.sub(thisSlope).div(thisSlope.mul(lineSlope).add(1)).abs().atan();
  }

  public isParallelTo(line: Line): boolean {
    return this.slope == line.slope;
  }

  public isPerpendicularTo(line: Line): boolean {
    if (this.isVertical) {
      return line.isHorizontal;
    }

    if (this.isHorizontal) {
      return line.isVertical;
    }

    if (line.isVertical) {
      return this.isHorizontal;
    }

    if (line.isHorizontal) {
      return this.isVertical;
    }

    const thisSlope = new Calculator(this.slope!);
    const lineSlope = new Calculator(line.slope!);

    return +thisSlope === +Calculator.div(-1, lineSlope);
  }

  public hasPoint(P: Point): boolean {
    const potentialY = this.getYValueAtX(P.x);

    return typeof potentialY === 'number' && potentialY === P.y;
  }

  private computeSlope(): number|undefined {
    const { P0, P1 } = this;
    const slope = Calculator.sub(P1.y, P0.y).div(Calculator.sub(P1.x, P0.x));

    if (slope.isFinite()) {
      return +slope;
    }
  }

  private computeYIntercept(): number|undefined {
    const { P0, slope, isVertical, isHorizontal } = this;

    if (isVertical) {
      return;
    }

    if (isHorizontal) {
      return P0.y;
    }

    return +Calculator.sub(P0.y, Calculator.mul(slope!, P0.x));
  }

  private computeReciprocal(): number|undefined {
    const { P0, P1 } = this;
    const reciprocal = Calculator.sub(P1.x, P0.x).div(Calculator.sub(P1.y, P0.y));

    if (reciprocal.isFinite()) {
      return +reciprocal;
    }
  }

  private computeXIntercept(): number|undefined {
    const { P0, reciprocal, isHorizontal, isVertical } = this;

    if (isVertical) {
      return P0.y;
    }

    if (isHorizontal) {
      return;
    }

    return +Calculator.sub(P0.x, Calculator.mul(reciprocal!, P0.y));
  }
}
