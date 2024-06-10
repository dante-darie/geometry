import { Decimal } from 'decimal.js';
import { Vector, Point, Figure } from '~abstracts';
import { Line } from '~figures';
import { IDimensional } from '~types';

type TThetaRange = [Decimal, Decimal];
type TAbsoluteValues = [Point, Decimal, Decimal, Decimal, boolean, boolean, Point];
type TRelativeValues = [Point, Decimal, Decimal, Decimal, boolean, boolean, Vector];
type TValues = TAbsoluteValues|TRelativeValues;

export class ArcCurve extends Figure implements IDimensional {
  private rx: Decimal;
  private ry: Decimal;
  private phi: Decimal;
  private largeArcFlag: boolean;
  private sweepFlag: boolean;
  private _P0: Point;
  private _P1: Point;
  private _V1: Vector;
  private P0_prime: Point;
  private center_prime: Point;
  private center: Point;
  private thetaRange: TThetaRange;
  private _criticalPoints: Point[];

  constructor(values: TValues) {
    super();

    const [firstControl, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, secondControl] = values;
    const secondControlIsVector = secondControl instanceof Vector;

    this.isRelative = secondControlIsVector;
    this._P0 = firstControl;
    this._P1 = !secondControlIsVector ? secondControl : firstControl.clone().translate(secondControl);
    this._V1 = secondControlIsVector ? secondControl : new Vector([firstControl, secondControl]);
    this.rx = rx;
    this.ry = ry;
    this.phi = xAxisRotation.mul(Math.PI).div(180);
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
    return this.phi.mul(180).div(Math.PI);
  }

  get values(): TValues {
    const { P0, P1, V1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag } = this;

    if (!this.isRelative) {
      return [P0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, P1];
    }

    return [P0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, V1];
  }

  public rotate(alpha: Decimal, about?: Point): this {
    super.rotate(alpha, about);

    const xAxis = new Line([this.center, new Vector({ dx: this.rx, dy: 0 })]);
    const phiXAxis = xAxis.clone().rotate(this.phi);
    const phiXAxisVector = phiXAxis.V;
    const centerXProjection = this.center.clone().translate(phiXAxisVector);
    const rotatedCenter = this.center.clone().rotate(alpha, about);
    const rotatedCenterXProjection = centerXProjection.rotate(alpha, about);
    const rotatedXAxis = new Line([rotatedCenter, rotatedCenterXProjection]);

    this.phi = xAxis.angleTo(rotatedXAxis);
    // this.sweepFlag = ??;

    return this;
  }

  public reflect(about: Point | Line): this {
    super.reflect(about);

    this.sweepFlag = !this.sweepFlag;

    if (about instanceof Line) {
      this.phi = this.phi.neg();
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

    return new ArcCurve(values as TValues);
  }

  public recompute() {
    this.thetaRange = this.computeThetaRange();
    this._criticalPoints = this.computeCriticalPoints();
  }

  private computeP0Prime(): Point {
    const { phi, P0, P1 } = this;
    const { x: x1, y: y1 } = P0;
    const { x: x2, y: y2 } = P1;
    const sinPhi = phi.sin();
    const cosPhi = phi.cos();
    const mx = x1.sub(x2).div(2);
    const my = y1.sub(y2).div(2);
    const x1_prime = cosPhi.mul(mx).add(sinPhi.mul(my));
    const y1_prime = sinPhi.neg().mul(mx).add(cosPhi.mul(my));

    return new Point({ x: x1_prime, y: y1_prime });
  }

  private adjustRadii(): void {
    const { rx, ry, P0_prime } = this;
    const { x: x1_prime, y: y1_prime } = P0_prime;
    const rx_sq = rx.pow(2);
    const ry_sq = ry.pow(2);
    const x1_prime_sq = x1_prime.pow(2);
    const y1_prime_sq = y1_prime.pow(2);

    const radii_check = x1_prime_sq.div(rx_sq).add((y1_prime_sq.div(ry_sq)));

    if (radii_check.gt(1)) {
      this.rx = rx.mul(radii_check.sqrt());
      this.ry = ry.mul(radii_check.sqrt());
    }
  }

  private computeCenterPrime(): Point {
    const { largeArcFlag, sweepFlag, rx, ry, P0_prime } = this;
    const { x: x1_prime, y: y1_prime } = P0_prime;
    const rx_sq = rx.pow(2);
    const ry_sq = ry.pow(2);
    const x1_prime_sq = x1_prime.pow(2);
    const y1_prime_sq = y1_prime.pow(2);

    const sign = new Decimal(largeArcFlag === sweepFlag ? -1 : 1);
    let sq = ((rx_sq.mul(ry_sq)).sub(rx_sq.mul(y1_prime_sq)).sub(ry_sq.mul(x1_prime_sq))).div((rx_sq.mul(y1_prime_sq)).add(ry_sq.mul(x1_prime_sq)));

    sq = sq.lt(0) ? new Decimal(0) : sq;

    const coef = sign.mul(sq.sqrt());
    const cx_prime = coef.mul(rx.mul(y1_prime).div(ry));
    const cy_prime = coef.mul((ry.mul(x1_prime).div(rx)).neg());

    return new Point({ x: cx_prime, y: cy_prime });
  }

  private computeCenter(): Point {
    const { phi, P0, P1, center_prime } = this;
    const { x: x1, y: y1 } = P0;
    const { x: x2, y: y2 } = P1;
    const { x: cx_prime, y: cy_prime } = center_prime;
    const sinPhi = phi.sin();
    const cosPhi = phi.cos();
    const dx = (x1.add(x2)).div(2);
    const dy = (y1.add(y2)).div(2);
    const cx = cosPhi.mul(cx_prime).sub(sinPhi.mul(cy_prime)).add(dx);
    const cy = sinPhi.mul(cx_prime).add(cosPhi.mul(cy_prime)).add(dy);

    return new Point({ x: cx, y: cy });
  }

  private computeCriticalPoints(): Point[] {
    const criticalThetas = this.computeCriticalThetas();
    const criticalPoints = criticalThetas.map((theta) => this.getPointForTheta(theta));

    return criticalPoints;
  }

  private computeCriticalThetas(): Decimal[] {
    const { rx, ry, phi } = this;
    const tanPhi = phi.tan();
    const cotPhi = Decimal.div(1, tanPhi);
    const xThetaPrincipal = this.getInRangeTheta((ry.neg().mul(tanPhi).div(rx)).atan());
    const yThetaPrincipal = this.getInRangeTheta((ry.mul(cotPhi).div(rx)).atan());
    const xThetaSecondary = this.getInRangeTheta(xThetaPrincipal.add(Math.PI));
    const yThetaSecondary = this.getInRangeTheta(yThetaPrincipal.add(Math.PI));
    const criticalThetas = [xThetaPrincipal, xThetaSecondary, yThetaPrincipal, yThetaSecondary];
    const [minTheta, maxTheta] = this.thetaRange;
    const inRangeCriticalThetas = criticalThetas.filter((theta) => theta.gte(minTheta) && theta.lte(maxTheta)) as Decimal[];

    return inRangeCriticalThetas;
  }

  private computeThetaRange(): TThetaRange {
    const { P0, P1 } = this;
    const theta1 = this.getThetaForPoint(P0);
    const theta2 = this.getThetaForPoint(P1);
    const thetaRange = [theta1, theta2].sort() as TThetaRange;

    return thetaRange;
  }

  private getThetaForPoint({ x, y }: Point): Decimal {
    const { center, phi, rx, ry } = this;
    const { x: cx, y: cy } = center;
    const sinPhi = phi.sin();
    const cosPhi = phi.cos();
    const dy = y.sub(cy);
    const dx = x.sub(cx);
    const sinTheta = dy.mul(cosPhi).sub(dx.mul(sinPhi)).div(ry);
    const cosTheta = dx.mul(cosPhi).add(dy.mul(sinPhi)).div(rx);
    const theta = Decimal.atan2(sinTheta, cosTheta);

    return this.getInRangeTheta(theta);
  }

  private getPointForTheta(theta: Decimal): Point {
    const { rx, ry, phi, center } = this;
    const cosPhi = phi.cos();
    const sinPhi = phi.sin();
    const cosTheta = theta.cos();
    const sinTheta = theta.sin();
    const x = rx.mul(cosPhi).mul(cosTheta).sub(ry.mul(sinPhi).mul(sinTheta)).add(center.x);
    const y = rx.mul(sinPhi).mul(cosTheta).add(ry.mul(cosPhi).mul(sinTheta)).add(center.y);

    return new Point({x, y});
  }

  private getInRangeTheta(theta: Decimal): Decimal {
    const PI2 = Decimal.mul(2, Math.PI);

    if (theta.lt(0)) {
      return theta.add(PI2);
    }

    if (theta.gt(PI2)) {
      return theta.mod(PI2);
    }

    return theta;
  }
}
