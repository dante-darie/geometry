import { Point } from '~abstracts';
import { Line } from '~figures';
import { Calculator } from './Calculator';

const xAxis = new Line([
  new Point({ x: 0, y: 0 }),
  new Point({ x: 1, y: 0 })
]);

const yAxis = new Line([
  new Point({ x: 0, y: 0 }),
  new Point({ x: 0, y: 1 })
]);

export {
  xAxis,
  yAxis,
  Calculator
};
