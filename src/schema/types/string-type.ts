import { CoreType } from './core-type';
import { generateUUID } from '../../utils/generate-uuid';
import { is } from '../../utils';
import { BuildSchemaError, ValidationError } from '../errors';
import { AutoFunction, CoreTypeOptions } from '../interfaces/schema.types';
import { CAST_STRATEGY, checkCastStrategy } from '../../utils/cast-strategy';

type FunctionsString = () => string[];

/**
 * Schema String type options.
 *
 * @field `enum` defines a list of allowed values.
 * @field `auto` that will generate the initial value of the field. It allows the value 'uuid' or a function. It cannot be used combined with default.
 * @field `lowercase` that will generate the lowercase value of the field. It cannot be used combined with uppercase.
 * @field `uppercase` that will generate the uppercase value of the field. It cannot be used combined with lowercase.
 * @field `trim` that will removes leading and trailing whitespace from the value.
 * @field `minLength` numeric value that will add a validator that ensures the given string's length is at least the given number
 * @field `maxLength` numeric value that will add a validator that ensures the given string's length is at most the given number
 *
 * ::: tip Note
 * Next examples would throw the following error:
 *
 *  _**BuildSchemaError**: '**lowercase**' and '**uppercase**' options cannot be used at the same time within
 *   property '**name**' definition._
 *
 * ```typescript
 * //...
 * const schema = new Schema({ name: {
 *    type: String,
 *    uppercase: true,
 *    lowercase: true
 * } })
 *
 * //...
 * const stringType = new StringType('name', { uppercase: true, lowercase: true });
 *
 * ```
 * :::
 * */
export interface StringTypeOptions extends CoreTypeOptions {
  enum?: string[] | FunctionsString;
  auto?: string;
  /**
   * @example
   * ```typescript
   * // using `lowercase` with StringType.cast
   * //...
   * const element = new StringType('name', { lowercase: true });
   * const result = element.cast('LOWER');
   * console.log(result); // lower
   * //...
   *
   * // using `lowercase` with Schema
   * //...
   * const schema = new Schema({ email: { type: String, lowercase: true } });
   * const User = model('User', schema);
   * const user = await User.create({ email: 'Dummy.ExamPle@Email.CoM' });
   * console.log(user.email); // dummy.example@email.com
   * //...
   * ```
   */
  lowercase?: boolean;
  /**
   * @example
   * ```typescript
   * // using `uppercase` with StringType.cast
   * //...
   * const element = new StringType('code', { uppercase: true });
   * const result = element.cast('upper');
   * console.log(result); // UPPER
   * //...
   *
   * // using `uppercase` with Schema
   * //...
   * const schema = new Schema({ code: { type: String, uppercase: true } });
   * const Card = model('Card', schema);
   * const card = await Card.create({ code: 'upper' });
   * console.log(card.code); // UPPER
   * //...
   * ```
   */
  uppercase?: boolean;
  /**
   * @example
   * ```typescript
   * // using `trim` with StringType.cast
   * //...
   * const element = new StringType('value', { trim: true });
   * const result = element.cast(' some text ');
   * console.log(result); // some text (without leading and trailing whitespace )
   * //...
   *
   * // using `trim` with Schema
   * //...
   * const schema = new Schema({ name: { type: String, trim: true } });
   * const User = model('User', schema);
   * const user = await User.create({ name: ' John Poe ' });
   * console.log(user.email); // John Poe (without leading and trailing whitespace )
   *
   * //...
   * ```
   */
  trim?: boolean;
  /**
   * @example
   * ```typescript
   * //...
   * const element = new StringType('value', { minLength: 5 });
   * element.validate('four');
   *
   * // ValidationError: Property 'value' is shorter than the minimum allowed length '5'
   *
   *
   * //This is another example with schema
   * const UserSchema = new Schema({
   *   name: { type: String, minLength: 4 },
   * });
   * const User = model('User', UserSchema);
   * const user = await User.create({
   *   name: 'Doe'
   * });
   *
   * // ValidationError: Property 'name' is shorter than the minimum allowed length '4'
   * //...
   * ```
   */
  minLength?: number;
  /**
   * @example
   * ```typescript
   * //...
   * const element = new StringType('value', { maxLength: 5 });
   * element.validate('eleven');
   *
   * // ValidationError: Property 'value' is longer than the maximum allowed length '5'
   *
   *
   * //This is another example with schema
   * const UserSchema = new Schema({
   *   name: { type: String, maxLength: 4 },
   * });
   * const User = model('User', UserSchema);
   * const user = await User.create({
   *   name: 'John Doe'
   * });
   *
   * // ValidationError: Property 'name' is longer than the maximum allowed length '4'
   *
   * //...
   * ```
   */
  maxLength?: number;
}

/**
 * `String` are plain JavaScript String and accepts the following options:
 *
 * ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field, allowed function, object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, allowed and value or function to generate it
 *  - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 * - **enum** defines a list of allowed values
 * - **auto** that will generate the initial value of the field. It allows the value 'uuid' or a function. It cannot be used combined with default
 *
 * @example
 * ```typescript
 * const userSchema =  new Schema({
 *   name: { type: String, auto: 'uuid', trim: true },
 *   gender: { type: String, enum: ['M', 'F'] }
 *   lastname: Schema.Types.String,
 *   user: { type: String, lowercase: true, minLength: 4, maxLength: 7 }
 * })
 * ```
 */
export class StringType extends CoreType {
  constructor(name: string, public options = {} as StringTypeOptions) {
    super(name, StringType.sName, options);
    this._checkIntegrity();
  }

  static sName = String.name;

  get enumValues(): unknown {
    return this.options.enum;
  }

  get auto(): string | AutoFunction | undefined {
    return this.options.auto;
  }

  private get lowercase(): boolean {
    return !!this.options.lowercase;
  }

  private get uppercase(): boolean {
    return !!this.options.uppercase;
  }

  private get trim(): boolean {
    return !!this.options.trim;
  }
  private get minLength(): number | undefined {
    return this.options.minLength;
  }
  private get maxLength(): number | undefined {
    return this.options.maxLength;
  }

  buildDefault(): string | undefined {
    if (this.auto === 'uuid') {
      return generateUUID();
    }
    const _value = super.buildDefault();
    return typeof _value === 'undefined' ? _value : String(_value);
  }

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP) {
    if (value === null) {
      return value;
    }
    let castedValue = String(value);
    if (is(castedValue, String) && !is(value, Object)) {
      if (this.lowercase) {
        castedValue = castedValue.toLowerCase();
      }
      if (this.uppercase) {
        castedValue = castedValue.toUpperCase();
      }
      if (this.trim) {
        castedValue = castedValue.trim();
      }
      return castedValue;
    }
    return checkCastStrategy(value, strategy, this);
  }

  validate(value: unknown, strategy) {
    super.validate(value, strategy);
    const _wrongType = this.isStrictStrategy(strategy) ? !is(value, String) : is(value, Object);
    if (_wrongType) {
      throw new ValidationError(`Property '${this.name}' must be of type '${this.typeName}'`);
    }
    if (value === null || value === undefined) {
      return value;
    }
    const errors: string[] = [];
    const _value = String(value);
    this._checkEnum(_value, errors);
    this._checkMinLength(_value, errors);
    this._checkMaxLength(_value, errors);
    this.checkValidator(_value);
    if (errors.length) {
      throw new ValidationError(errors.join('\n'));
    }
    return _value;
  }

  private _checkEnum(value: string, errors: string[]): void {
    if (value !== 'undefined' && typeof this.enumValues !== 'undefined') {
      const _enumValues = typeof this.enumValues === 'function' ? this.enumValues() : this.enumValues;
      if (!_enumValues.includes(value)) {
        errors.push(`Property '${this.name}' value must be ${_enumValues.join(',')}`);
      }
    }
  }

  private _checkMinLength(value: string, errors: string[]): void {
    const length = this.minLength as any;
    if (is(length, Number) && value.length < length) {
      errors.push(`Property '${this.name}' is shorter than the minimum allowed length '${length}'`);
    }
  }

  private _checkMaxLength(value: string, errors: string[]): void {
    const length = this.maxLength as any;
    if (is(length, Number) && value.length > length) {
      errors.push(`Property '${this.name}' is longer than the maximum allowed length '${length}'`);
    }
  }

  private _checkIntegrity() {
    if (this.auto !== undefined) {
      if (this.default !== undefined) {
        throw new BuildSchemaError(
          `Auto and default values cannot be used at the same time in property '${this.name}'.`,
        );
      }
      if (this.auto === 'uuid' && this.typeName !== String.name) {
        throw new BuildSchemaError('Automatic uuid properties must be string typed.');
      }
    }
    if (this.lowercase && this.uppercase) {
      throw new BuildSchemaError(
        `'lowercase' and 'uppercase' options cannot be used at the same time within property '${this.name}' definition.`,
      );
    }
  }

  isEmpty(value: string): boolean {
    return [, null, ''].includes(value);
  }
}

export const stringTypeFactory = (key: string, opts: StringTypeOptions): StringType => new StringType(key, opts);
