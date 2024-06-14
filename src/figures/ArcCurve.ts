import { Vector, Point, Figure } from '~abstracts';
import { Line } from '~figures';
import { IComplex, IDimensional, TArcValues, TRange } from '~types';
import { Calculator } from '~utilities';

export class ArcCurve extends Figure implements IDimensional, IComplex {
  private rx: number;
  private ry: number;
  private phi: number;
  private largeArcFlag: boolean;
  private sweepFlag: boolean;
  private _P0: Point;
  private _P1: Point;
  private _V1: Vector;
  private P0_prime: Point;
  private center_prime: Point;
  private center: Point;
  private thetaRange: TRange;
  private _criticalPoints: Point[];

  constructor(values: TArcValues) {
    super();

    const [firstControl, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, secondControl] = values;
    const secondControlIsVector = secondControl instanceof Vector;

    this.isRelative = secondControlIsVector;
    this._P0 = firstControl;
    this._P1 = !secondControlIsVector ? secondControl : firstControl.clone().translate(secondControl);
    this._V1 = secondControlIsVector ? secondControl : new Vector([firstControl, secondControl]);
    this.rx = rx;
    this.ry = ry;
    this.phi = +Calculator.mul(xAxisRotation, Math.PI).div(180);
    this.largeArcFlag = largeArcFlag;
    this.sweepFlag = sweepFlag;
    this.P0_prime = this.computeP0Prime();

    this.adjustRadii();

    this.center_prime = this.computeCenterPrime();
    this.center = this.computeCenter();
    this.thetaRange = this.computeThetaRange();
    this._criticalPoints = this.computeCriticalPoints();

    this.points = [this.P0, this.P1, this.P0_prime, this.center, this.center_prime];
    this.vectors = [this.V1];
  }

  get P0() {
    return this._P0;
  }

  get P1() {
    return this._P1;
  }

  get V1() {
    return this._V1;
  }

  get criticalPoints() {
    return this._criticalPoints;
  }

  get xAxisRotation() {
    return +Calculator.mul(this.phi, 180).div(Math.PI);
  }

  get values(): TArcValues {
    const { P0, P1, V1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag } = this;

    if (!this.isRelative) {
      return [P0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, P1];
    }

    return [P0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, V1];
  }

  public rotate(alpha: number, about?: Point): this {
    super.rotate(alpha, about);

    const xAxis = new Line([this.center, new Vector({ dx: this.rx, dy: 0 })]);
    const phiXAxis = xAxis.clone().rotate(this.phi);
    const phiXAxisVector = phiXAxis.V;
    const centerXProjection = this.center.clone().translate(phiXAxisVector);
    const rotatedCenter = this.center.clone().rotate(alpha, about);
    const rotatedCenterXProjection = centerXProjection.rotate(alpha, about);
    const rotatedXAxis = new Line([rotatedCenter, rotatedCenterXProjection]);

    this.phi = xAxis.angleTo(rotatedXAxis);

    return this;
  }

  public reflect(about: Point | Line): this {
    super.reflect(about);

    this.sweepFlag = !this.sweepFlag;

    if (about instanceof Line) {
      this.phi = +new Calculator(this.phi).neg();
    }

    return this;
  }

  public clone() {
    const values = this.values.map((value) => {
      if (value instanceof Point || value instanceof Vector) {
        return value.clone();
      }

      return value;
    });

    return new ArcCurve(values as TArcValues);
  }

  public scale(factor: number, about: Point = new Point({ x: 0, y: 0 })): this {
    super.scale(factor, about, false);

    this.rx = +Calculator.mul(this.rx, factor);
    this.ry = +Calculator.mul(this.ry, factor);

    this.recompute(); // Needs optimization.

    return this;
  }

  public recompute() {
    this.P0_prime = this.computeP0Prime();
    this.adjustRadii();
    this.center_prime = this.computeCenterPrime();
    this.center = this.computeCenter();
    this.thetaRange = this.computeThetaRange();
    this._criticalPoints = this.computeCriticalPoints();
  }

  private computeP0Prime(): Point {
    const { phi, P0, P1 } = this;
    const { x: x1, y: y1 } = P0;
    const { x: x2, y: y2 } = P1;
    const sinPhi = Calculator.sin(phi);
    const cosPhi = Calculator.cos(phi);
    const mx = Calculator.sub(x1, x2).div(2);
    const my = Calculator.sub(y1, y2).div(2);
    const x1_prime = cosPhi.mul(mx).add(sinPhi.mul(my));
    const y1_prime = sinPhi.neg().mul(mx).add(cosPhi.mul(my));

    return new Point({
      x: +x1_prime,
      y: +y1_prime
    });
  }

  private adjustRadii(): void {
    const { rx, ry, P0_prime } = this;
    const { x: x1_prime, y: y1_prime } = P0_prime;
    const rx_sq = Calculator.pow(rx, 2);
    const ry_sq = Calculator.pow(ry, 2);
    const x1_prime_sq = Calculator.pow(x1_prime, 2);
    const y1_prime_sq = Calculator.pow(y1_prime, 2);

    const radii_check = x1_prime_sq.div(rx_sq).add((y1_prime_sq.div(ry_sq)));

    if (+radii_check > 1) {
      this.rx = +Calculator.mul(rx, radii_check.sqrt());
      this.ry = +Calculator.mul(ry, radii_check.sqrt());
    }
  }

  private computeCenterPrime(): Point {
    const { largeArcFlag, sweepFlag, rx, ry, P0_prime } = this;
    const { x: x1_prime, y: y1_prime } = P0_prime;
    const rx_sq = Calculator.pow(rx, 2);
    const ry_sq = Calculator.pow(ry, 2);
    const x1_prime_sq = Calculator.pow(x1_prime, 2);
    const y1_prime_sq = Calculator.pow(y1_prime, 2);

    const sign = new Calculator(largeArcFlag === sweepFlag ? -1 : 1);
    let sq = ((rx_sq.mul(ry_sq)).sub(rx_sq.mul(y1_prime_sq)).sub(ry_sq.mul(x1_prime_sq))).div((rx_sq.mul(y1_prime_sq)).add(ry_sq.mul(x1_prime_sq)));

    sq = +sq < 0 ? new Calculator(0) : sq;

    const coef = sign.mul(sq.sqrt());
    const cx_prime = coef.mul(Calculator.mul(rx, y1_prime).div(ry));
    const cy_prime = coef.mul((Calculator.mul(ry, x1_prime).div(rx)).neg());

    return new Point({
      x: +cx_prime,
      y: +cy_prime
    });
  }

  private computeCenter(): Point {
    const { phi, P0, P1, center_prime } = this;
    const { x: x1, y: y1 } = P0;
    const { x: x2, y: y2 } = P1;
    const { x: cx_prime, y: cy_prime } = center_prime;
    const sinPhi = new Calculator(phi).sin();
    const cosPhi = new Calculator(phi).cos();
    const dx = (Calculator.add(x1, x2)).div(2);
    const dy = (Calculator.add(y1, y2)).div(2);
    const cx = cosPhi.mul(cx_prime).sub(sinPhi.mul(cy_prime)).add(dx);
    const cy = sinPhi.mul(cx_prime).add(cosPhi.mul(cy_prime)).add(dy);

    return new Point({
      x: +cx,
      y: +cy
    });
  }

  private computeCriticalPoints(): Point[] {
    const criticalThetas = this.computeCriticalThetas();
    const criticalPoints = criticalThetas.map((theta) => this.getPointForTheta(theta));

    return criticalPoints;
  }

  private computeCriticalThetas(): Calculator[] {
    const { rx, ry, phi } = this;
    const tanPhi = Calculator.tan(phi);
    const cotPhi = Calculator.div(1, tanPhi);
    const xThetaPrincipal = this.getInRangeTheta((Calculator.neg(ry).mul(tanPhi).div(rx)).atan());
    const yThetaPrincipal = this.getInRangeTheta((Calculator.mul(ry, cotPhi).div(rx)).atan());
    const xThetaSecondary = this.getInRangeTheta(xThetaPrincipal.add(Math.PI));
    const yThetaSecondary = this.getInRangeTheta(yThetaPrincipal.add(Math.PI));
    const criticalThetas = [xThetaPrincipal, xThetaSecondary, yThetaPrincipal, yThetaSecondary];
    const [minTheta, maxTheta] = this.thetaRange;
    const inRangeCriticalThetas = criticalThetas.filter((theta) => (+theta >= +minTheta && +theta <= +maxTheta)) as Calculator[];

    return inRangeCriticalThetas;
  }

  private computeThetaRange(): TRange {
    const { P0, P1 } = this;
    const theta1 = this.getThetaForPoint(P0);
    const theta2 = this.getThetaForPoint(P1);
    const thetaRange = [theta1, theta2].sort() as TRange;

    return thetaRange;
  }

  private getThetaForPoint({ x, y }: Point): Calculator {
    const { center, phi, rx, ry } = this;
    const { x: cx, y: cy } = center;
    const sinPhi = Calculator.sin(phi);
    const cosPhi = Calculator.cos(phi);
    const dy = Calculator.sub(y, cy);
    const dx = Calculator.sub(x, cx);
    const sinTheta = dy.mul(cosPhi).sub(dx.mul(sinPhi)).div(ry);
    const cosTheta = dx.mul(cosPhi).add(dy.mul(sinPhi)).div(rx);
    const theta = Calculator.atan2(sinTheta, cosTheta);

    return this.getInRangeTheta(theta);
  }

  private getPointForTheta(theta: Calculator): Point {
    const { rx, ry, phi, center } = this;
    const cosPhi = new Calculator(phi).cos();
    const sinPhi = new Calculator(phi).sin();
    const cosTheta = theta.cos();
    const sinTheta = theta.sin();
    const x = +Calculator.mul(rx, cosPhi).mul(cosTheta).sub(Calculator.mul(ry, sinPhi).mul(sinTheta)).add(center.x);
    const y = +Calculator.mul(rx, sinPhi).mul(cosTheta).add(Calculator.mul(ry, cosPhi).mul(sinTheta)).add(center.y);

    return new Point({ x, y });
  }

  private getInRangeTheta(theta: Calculator): Calculator {
    const PI2 = Calculator.mul(2, Math.PI);

    if (+theta < 0) {
      return theta.add(PI2);
    }

    if (+theta > +PI2) {
      return theta.mod(PI2);
    }

    return theta;
  }
}
