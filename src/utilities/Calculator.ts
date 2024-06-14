import { Decimal } from 'decimal.js';

type TInput = Calculator|number;

export class Calculator {
  private _instance: Decimal;

  constructor(arg: number) {
    this._instance = new Decimal(arg);
  }

  public valueOf(): number {
    return this._instance.toNumber();
  }

  public isFinite() {
    return this._instance.isFinite();
  }

  public mul(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('mul', [this, second]);
  }

  public static mul(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('mul', [first, second]);
  }

  public div(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('div', [this, second]);
  }

  public static div(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('div', [first, second]);
  }

  public add(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('add', [this, second]);
  }

  public static add(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('add', [first, second]);
  }

  public sub(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('sub', [this, second]);
  }

  public static sub(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('sub', [first, second]);
  }

  public pow(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('pow', [this, second]);
  }

  public static pow(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('pow', [first, second]);
  }

  public atan2(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('atan2', [this, second]);
  }

  public static atan2(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('atan2', [first, second]);
  }

  public mod(second: TInput): Calculator {
    return Calculator.computeBinaryOperation('mod', [this, second]);
  }

  public static mod(first: TInput, second: TInput): Calculator {
    return Calculator.computeBinaryOperation('mod', [first, second]);
  }

  public abs(): Calculator {
    return Calculator.computeUnaryOperation('abs', this);
  }

  public static abs(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('abs', arg);
  }

  public neg(): Calculator {
    return Calculator.computeUnaryOperation('neg', this);
  }

  public static neg(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('neg', arg);
  }

  public sqrt(): Calculator {
    return Calculator.computeUnaryOperation('sqrt', this);
  }

  public static sqrt(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('sqrt', arg);
  }

  public sin(): Calculator {
    return Calculator.computeUnaryOperation('sin', this);
  }

  public static sin(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('sin', arg);
  }

  public cos(): Calculator {
    return Calculator.computeUnaryOperation('cos', this);
  }

  public static cos(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('cos', arg);
  }

  public acos(): Calculator {
    return Calculator.computeUnaryOperation('acos', this);
  }

  public static acos(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('acos', arg);
  }

  public tan(): Calculator {
    return Calculator.computeUnaryOperation('tan', this);
  }

  public static tan(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('tan', arg);
  }

  public atan(): Calculator {
    return Calculator.computeUnaryOperation('atan', this);
  }

  public static atan(arg: TInput): Calculator {
    return Calculator.computeUnaryOperation('atan', arg);
  }

  public static max(args: TInput[]): Calculator {
    return Calculator.computeIndefiniteOperation('max', args);
  }

  public static min(args: TInput[]): Calculator {
    return Calculator.computeIndefiniteOperation('min', args);
  }

  private static computeBinaryOperation(operation: ('mul'|'div'|'add'|'sub'|'pow'|'atan2'|'mod'), args: [TInput, TInput]): Calculator {
    const [a, b] = Calculator.toDecimalArgs(args);
    const result = Decimal[operation](a, b).toNumber();

    return new Calculator(result);
  }

  private static computeUnaryOperation(operation: ('neg'|'sqrt'|'sin'|'cos'|'acos'|'tan'|'atan'|'abs'), arg: TInput): Calculator {
    const [a] = Calculator.toDecimalArgs([arg]);
    const result = new Decimal(a)[operation]().toNumber();

    return new Calculator(result);
  }

  private static computeIndefiniteOperation(operation: ('max'|'min'), args: TInput[]): Calculator {
    const nargs = Calculator.toDecimalArgs(args);
    const result = Decimal[operation](...nargs).toNumber();

    return new Calculator(result);
  }

  private static toDecimalArgs(args: TInput[]): number[] {
    return args.map((arg) => +arg);
  }
}
