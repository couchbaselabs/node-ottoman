import {
  arrayTypeFactory,
  booleanTypeFactory,
  CoreType,
  dateTypeFactory,
  embedTypeFactory,
  numberTypeFactory,
  referenceTypeFactory,
  stringTypeFactory,
} from './types';
import { BuildSchemaError } from './errors';
import { SchemaIndex, SchemaQuery } from '../model/index/types/index.types';
import { getGlobalPlugins } from '../plugins/global-plugin-handler';
import { buildFields, validate } from './helpers';
import { HOOKS, HookTypes } from '../utils/hooks';
import {
  IOttomanType,
  CustomValidations,
  FieldMap,
  PluginConstructor,
  SchemaDef,
  SchemaOptions,
  SupportType,
} from './interfaces/schema.types';
import { HookHandler } from './interfaces/schema.types';
import { cast, CAST_STRATEGY, CastOptions } from '../utils/cast-strategy';

export class Schema {
  static Types: SupportType = {
    String: stringTypeFactory,
    Boolean: booleanTypeFactory,
    Number: numberTypeFactory,
    Date: dateTypeFactory,
    Array: arrayTypeFactory,
    Reference: referenceTypeFactory,
    Embed: embedTypeFactory,
  };
  static validators: CustomValidations = {};
  statics: any = {};
  methods: any = {};
  preHooks: any = {};
  postHooks: any = {};
  index: SchemaIndex = {};
  queries: SchemaQuery = {};
  fields: FieldMap;
  options: SchemaOptions;

  /**
   * @summary Creates an instance of Schema
   * @name Schema
   * @class
   * @public
   *
   * @param obj Schema definition
   * @param options Settings to build schema
   * @param options.strict will remove fields if they aren't defined in the schema
   * @param options.preHooks initialization of preHooks since Schema constructor
   * @param options.postHooks initialization of postHooks since Schema constructor
   * @returns Schema
   *
   * @example
   * ```ts
   *  const schema = new Schema({name: String, age: {type: Number, intVal: true, min: 18}});
   * ```
   */
  constructor(obj: SchemaDef | Schema, options: SchemaOptions = { strict: true }) {
    const preHooks = options?.preHooks;
    const postHooks = options?.postHooks;
    this.options = options;
    const strict = options?.strict || false;
    this.fields = buildFields(obj, strict);
    this.plugin(...getGlobalPlugins());
    if (preHooks !== undefined) {
      this._initPreHooks(HOOKS.VALIDATE, preHooks[HOOKS.VALIDATE]);
      this._initPreHooks(HOOKS.SAVE, preHooks[HOOKS.SAVE]);
      this._initPreHooks(HOOKS.UPDATE, preHooks[HOOKS.UPDATE]);
      this._initPreHooks(HOOKS.REMOVE, preHooks[HOOKS.REMOVE]);
    }
    if (postHooks !== undefined) {
      this._initPostHooks(HOOKS.VALIDATE, postHooks[HOOKS.VALIDATE]);
      this._initPostHooks(HOOKS.SAVE, postHooks[HOOKS.SAVE]);
      this._initPostHooks(HOOKS.UPDATE, postHooks[HOOKS.UPDATE]);
      this._initPostHooks(HOOKS.REMOVE, postHooks[HOOKS.REMOVE]);
    }
  }
  /**
   * Validate a model instance using the definition of the schema
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const schema = new Schema({name: String, age: {type: Number, intVal: true, min: 18}});
   *   const result = schema.validate({name: 'John Doe', age: '34'});
   *   console.log(result)
   * ```
   * > {name: 'John Doe', age: 34}
   */
  validate(data: unknown, options: { strict?: boolean } = {}) {
    const _options = {
      strategy: CAST_STRATEGY.THROW,
      strict: options.strict !== undefined ? options.strict : this.options.strict,
    };
    return validate(data, this, _options);
  }

  /**
   * Cast a model instance using schema definition
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const schema = new Schema({name: String, age: {type: Number}});
   *   const result = schema.cast({name: 'John Doe', age: '34'});
   *   console.log(result)
   * ```
   * > {name: 'John Doe', age: 34}
   */
  cast(data: unknown, options: CastOptions = {}) {
    options.strict = options.strict !== undefined ? options.strict : this.options.strict;
    return cast(data, this, options);
  }

  /**
   * Applies default values defined on schema to an object instance
   * @method
   * @public
   * @param obj
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5}});
   *   const result = schema.applyDefaultsToObject({});
   *   console.log(result)
   * ```
   * > { amount: 5 }
   */
  applyDefaultsToObject(obj) {
    for (const key in this.fields) {
      const field = this.fields[key];
      if (typeof obj[field.name] === 'undefined' && field instanceof CoreType) {
        const _val = field.buildDefault();
        if (typeof _val !== 'undefined') {
          obj[field.name] = _val;
        }
      }
    }
    return obj;
  }
  /**
   * Allows access to specify field.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5}});
   *   const field = schema.path('amount');
   *   console.log(field.typeName);
   * ```
   * > Number
   */

  path(path: string): IOttomanType | undefined {
    return this.fields[path];
  }

  /**
   * Allows to apply plugins, to extend schema and model features.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5}});
   *   schema.plugin((schema) => console.log(schema.path('amount').typeName));
   * ```
   * > Number
   */
  plugin(...fns: PluginConstructor[]): Schema {
    if (fns && Array.isArray(fns)) {
      for (const fn of fns) {
        fn(this);
      }
    }
    return this;
  }

  /**
   * Allows to register a hook method.
   * Pre hooks are executed before the hooked method.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5}});
   *   schema.pre(HOOKS.validate, (doc) => console.log(doc));
   * ```
   */
  pre(hook: HookTypes, handler: HookHandler): Schema {
    Schema.checkHook(hook);
    if (this.preHooks[hook] === undefined) {
      this.preHooks[hook] = [];
    }
    this.preHooks[hook].push(handler);
    return this;
  }

  /**
   * Allows to register a hook function.
   * Post hooks are executed after the hooked method.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5}});
   *   schema.post(HOOKS.validate, (doc) => console.log(doc));
   * ```
   */
  post(hook: HookTypes, handler: HookHandler): Schema {
    Schema.checkHook(hook);
    if (this.postHooks[hook] === undefined) {
      this.postHooks[hook] = [];
    }
    this.postHooks[hook].push(handler);
    return this;
  }

  private static checkHook(hook: HookTypes): void {
    if (!(Object.values(HOOKS) as string[]).includes(hook)) {
      throw new BuildSchemaError(`The hook ${hook} is not allowed`);
    }
  }

  private _initPreHooks(hook: HOOKS, handlers: HookHandler[] | HookHandler | undefined) {
    if (handlers !== undefined) {
      if (typeof handlers === 'function') {
        handlers = [handlers];
      }
      for (const i in handlers) {
        if (typeof handlers[i] === 'function') {
          this.pre(hook, handlers[i]);
        }
      }
    }
  }

  private _initPostHooks(hook: HOOKS, handlers: HookHandler[] | HookHandler | undefined) {
    if (handlers !== undefined) {
      if (typeof handlers === 'function') {
        handlers = [handlers];
      }
      for (const i in handlers) {
        if (typeof handlers[i] === 'function') {
          this.post(hook, handlers[i]);
        }
      }
    }
  }
}
