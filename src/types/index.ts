import { Point, Vector } from '~abstracts';
import { Line } from '~figures';
import { Calculator } from '~utilities';

export interface IBoundingBox {
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
}

export interface ISize {
  width: number,
  height: number
}

export interface ISpatial {
  readonly values: (Point|Vector|number|boolean)[]
}

export interface IClonable {
  clone(): unknown
}

export interface IComplex {
  recompute(): void
}

export interface IDirectional extends ISpatial, IClonable {
  reflect(about: Point|Line): void,
  rotate(phi: number, about?: Point): void
}

export interface IPositional extends IDirectional {
  translate(vector: Vector): void
}

export interface IDimensional extends IPositional {
  scale(factor: number|[number, number], about?: Point): void,
  boundingBox: IBoundingBox
}

export type TNumeric = Calculator|number;

export type TRange = [TNumeric, TNumeric];

export type TAxis = 'x'|'y';
export type TAxii = ['x', 'y'];

export type TLineRelativeValues = [Point, Vector];
export type TLineAbsoluteValues = [Point, Point];
export type TLineValues = TLineAbsoluteValues|TLineRelativeValues;

export type TQuadraticAbsoluteValues = [Point, Point, Point];
export type TQuadraticRelativeValues = [Point, Vector, Vector];
export type TQuadraticValues = TQuadraticAbsoluteValues|TQuadraticRelativeValues;

export type TCubicAbsoluteValues = [Point, Point, Point, Point];
export type TCubicRelativeValues = [Point, Vector, Vector, Vector];
export type TCubicValues = TCubicAbsoluteValues|TCubicRelativeValues;

export type TArcAbsoluteValues = [Point, number, number, number, boolean, boolean, Point];
export type TArcRelativeValues = [Point, number, number, number, boolean, boolean, Vector];
export type TArcValues = TArcAbsoluteValues|TArcRelativeValues;

export type TCircleValues = [Point, number];

export type TEllipseValues = [Point, number, number];

export type TPolygonValues = [Point, Point, Point, ...Point[]];
