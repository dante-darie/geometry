import { Decimal } from 'decimal.js';
import { Figure, Point, Vector } from '~abstracts';
import { IDimensional } from '~types';

type TRelativeValues = [Point, Vector];
type TAbsoluteValues = [Point, Point];
type TValues = TAbsoluteValues|TRelativeValues;

export class Line extends Figure implements IDimensional {
  private _P0: Point;
  private _P1: Point; // Not necessary for point calculations but it is useful when using Line as a segment.
  private _V: Vector;
  private slope: Decimal|undefined;
  private reciprocal: Decimal|undefined;
  private yIntercept: Decimal|undefined;
  private xIntercept: Decimal|undefined;

  constructor(values: TValues) {
    super();

    const [P0, anchor] = values;

    if (anchor instanceof Vector) {
      this.isRelative = true;
      this._V = anchor;
      this._P1 = new Point({
        x: P0.x.add(anchor.dx),
        y: P0.y.add(anchor.dy)
      });
    } else { // anchor instanceof Point
      this._P1 = anchor;
      this._V = new Vector({
        dx: anchor.x.sub(P0.x),
        dy: anchor.y.sub(P0.y),
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

  get values(): TValues {
    if (!this.isRelative) {
      return [this.P0, this.P1];
    }

    return [this.P0, this.V];
  }

  get isHorizontal() {
    const { slope, isVertical } = this;

    return !isVertical && slope!.eq(0);
  }

  get isVertical() {
    const { slope } = this;

    return typeof slope === 'undefined';
  }

  get a() {
    const { slope, isVertical, isHorizontal } = this;

    if (isHorizontal) {
      return new Decimal(0);
    }

    if (isVertical) {
      return new Decimal(1);
    }

    return slope!;
  }

  get b() {
    const { isVertical, isHorizontal } = this;

    if (isHorizontal || isVertical) {
      return new Decimal(1);
    }

    return new Decimal(-1);
  }

  get c() {
    const { isVertical, isHorizontal, yIntercept, xIntercept } = this;

    if (isHorizontal) {
      return yIntercept!.neg();
    }

    if (isVertical) {
      return xIntercept!.neg();
    }

    return yIntercept!;
  }

  public clone() {
    const values = this.values.map((value) => value.clone());

    return new Line(values as TValues);
  }

  public getPointAtParameter(t: Decimal|number): Point {
    const { P0, V } = this;

    return new Point({
      x: P0.x.add(V.dx.mul(t)),
      y: P0.y.add(V.dy.mul(t))
    });
  }

  public getYValueAtX(x: Decimal|number): Decimal|undefined {
    const { slope, yIntercept } = this;

    if (typeof slope === 'undefined') {
      return;
    }

    if (typeof yIntercept === 'undefined') {
      return slope.mul(x);
    }

    return slope.mul(x).add(yIntercept);
  }

  public getXValueAtY(y: Decimal|number): Decimal|undefined {
    const { reciprocal, xIntercept } = this;

    if (typeof reciprocal === 'undefined') {
      return;
    }

    if (typeof xIntercept === 'undefined') {
      return reciprocal.mul(y);
    }

    return reciprocal.mul(y).add(xIntercept);
  }

  public getPerpendicularThrough(I: Point): Line {
    if (this.hasPoint(I)) {
      return this.clone().rotate(new Decimal(Math.PI).div(2), I);
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
      const randomX = new Decimal(1);
      perpendicularProjection = new Point({
        x: randomX,
        y: randomX.mul(1).div(slope!).neg().add(I.x.div(slope!)).add(I.y)
      });
    }

    return perpendicularProjection;
  }

  public getIntersectionPoint(line: Line): Point|undefined {
    if (this.isParallelTo(line)) {
      return;
    }

    const denominator = this.a.mul(line.b).sub(line.a.mul(this.b));
    const x = this.b.mul(line.c).sub(line.b.mul(this.c)).div(denominator);
    const y = this.c.mul(line.a).sub(line.c.mul(this.a)).div(denominator);

    return new Point({ x, y });
  }

  public recompute(): void {
    this.slope = this.computeSlope();
    this.yIntercept = this.computeYIntercept();
    this.reciprocal = this.computeReciprocal();
    this.xIntercept = this.computeXIntercept();
  }

  public angleTo(line: Line): Decimal {
    if (this.isParallelTo(line)) {
      return new Decimal(0);
    }

    if (this.isPerpendicularTo(line)) {
      return new Decimal(Math.PI).div(2);
    }

    const thisSlope = this.slope!;
    const lineSlope = line.slope!;

    return lineSlope.sub(thisSlope).div(thisSlope.mul(lineSlope).add(1)).abs().atan();
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

    const thisSlope = this.slope!;
    const lineSlope = line.slope!;

    return thisSlope.eq(new Decimal(-1).div(lineSlope));
  }

  public hasPoint(P: Point): boolean {
    const potentialY = this.getYValueAtX(P.x);

    return !!potentialY?.eq(P.y);
  }

  private computeSlope(): Decimal|undefined {
    const { P0, P1 } = this;
    const slope = P1.y.sub(P0.y).div(P1.x.sub(P0.x));

    if (slope.isFinite()) {
      return slope;
    }
  }

  private computeYIntercept(): Decimal|undefined {
    const { P0, slope, isVertical, isHorizontal } = this;

    if (isVertical) {
      return;
    }

    if (isHorizontal) {
      return P0.y;
    }

    return P0.y.sub(slope!.mul(P0.x));
  }

  private computeReciprocal(): Decimal|undefined {
    const { P0, P1 } = this;
    const reciprocal = P1.x.sub(P0.x).div(P1.y.sub(P0.y));

    if (reciprocal.isFinite()) {
      return reciprocal;
    }
  }

  private computeXIntercept(): Decimal|undefined {
    const { P0, reciprocal, isHorizontal, isVertical } = this;

    if (isVertical) {
      return P0.y;
    }

    if (isHorizontal) {
      return;
    }

    return P0.x.sub(reciprocal!.mul(P0.y));
  }
}
