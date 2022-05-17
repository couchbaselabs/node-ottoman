import {
  ArrayType,
  arrayTypeFactory,
  BooleanType,
  booleanTypeFactory,
  CoreType,
  DateType,
  dateTypeFactory,
  EmbedType,
  embedTypeFactory,
  MixedType,
  mixedTypeFactory,
  NumberType,
  numberTypeFactory,
  ReferenceType,
  referenceTypeFactory,
  StringType,
  stringTypeFactory,
} from './types';
import { BuildSchemaError } from './errors';
import { SchemaIndex, SchemaQuery } from '../model/index/types/index.types';
import { getGlobalPlugins } from '../plugins/global-plugin-handler';
import { buildFields, validate } from './helpers';
import { HOOKS, HookTypes } from '../utils/hooks';
import {
  CustomValidations,
  FieldMap,
  HookHandler,
  IOttomanType,
  PluginConstructor,
  SchemaDef,
  SchemaOptions,
  SupportFactoryTypes,
  SupportTypes,
} from './interfaces/schema.types';
import { cast, CAST_STRATEGY, CastOptions } from '../utils/cast-strategy';
import { mergeHooks } from './helpers/fn-schema';

const addTimestamp = (obj, field, currentTime) => {
  if (obj[field]) {
    if (typeof obj[field] === 'function') {
      obj[field] = { type: obj[field] };
    }
    obj[field].default = currentTime;
  } else {
    obj[field] = { type: Date, default: currentTime };
  }
};

export class Schema {
  static FactoryTypes: SupportFactoryTypes = {
    String: stringTypeFactory,
    Boolean: booleanTypeFactory,
    Number: numberTypeFactory,
    Date: dateTypeFactory,
    Array: arrayTypeFactory,
    Reference: referenceTypeFactory,
    Embed: embedTypeFactory,
    Mixed: mixedTypeFactory,
  };
  static Types: SupportTypes = {
    String: StringType.prototype,
    Boolean: BooleanType.prototype,
    Number: NumberType.prototype,
    Date: DateType.prototype,
    Array: ArrayType.prototype,
    Reference: ReferenceType.prototype,
    Embed: EmbedType.prototype,
    Mixed: MixedType.prototype,
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
   * @summary Creates an instance of Schema.
   * @name Schema
   * @class
   * @public
   *
   * @param obj Schema definition
   * @param options Settings to build schema
   * @param options.strict removes fields if they aren't defined in the schema
   * @param options.preHooks initialization of preHooks since Schema constructor
   * @param options.postHooks initialization of postHooks since Schema constructor
   * @returns Schema
   *
   * @example
   * ```ts
   *  const schema = new Schema({ name: String, age: { type: Number, intVal: true, min: 18 } });
   * ```
   */
  constructor(obj: SchemaDef | Schema, options: SchemaOptions = { strict: true }) {
    const preHooks = options?.preHooks;
    const postHooks = options?.postHooks;
    this.options = options;
    const strict = options?.strict === undefined ? true : options.strict;
    let timestamps = options.timestamps;
    if (timestamps === true) {
      timestamps = { createdAt: true, updatedAt: true };
    }
    if (timestamps) {
      let createdAt = 'createdAt';
      let updatedAt = 'updatedAt';

      if (typeof timestamps === 'object') {
        const currentTime =
          timestamps.currentTime ||
          function () {
            return new Date();
          };
        if (timestamps.createdAt || timestamps.currentTime) {
          createdAt = typeof timestamps.createdAt === 'string' ? timestamps.createdAt : createdAt;
          addTimestamp(obj, createdAt, currentTime);
        }
        if (timestamps.updatedAt || timestamps.currentTime) {
          updatedAt = typeof timestamps.updatedAt === 'string' ? timestamps.updatedAt : updatedAt;
          addTimestamp(obj, updatedAt, currentTime);
          this.pre(HOOKS.UPDATE, (doc) => {
            doc[updatedAt] = typeof currentTime === 'function' ? currentTime() : currentTime;
            return doc;
          });
        }
      }
    }
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
   * Validate a model instance using the definition of the schema.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const schema = new Schema({ name: String, age: { type: Number, intVal: true, min: 18 } });
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
   * Cast a model instance using schema definition.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const schema = new Schema({ name: String, age: {type: Number }});
   *   const result = schema.cast({ name: 'John Doe', age: '34' });
   *   console.log(result)
   * ```
   * > { name: 'John Doe', age: 34 }
   */
  cast(data: unknown, options: CastOptions = {}) {
    options.strict = options.strict !== undefined ? options.strict : this.options.strict;
    return cast(data, this, options);
  }

  /**
   * Applies default values defined on schema to an object instance.
   * @method
   * @public
   * @param obj
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5 } });
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
   * Allows access to a specific field.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5 } });
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
   *   const schema = new Schema({ amount: { type: Number, default: 5 } });
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
   * Register a hook method.
   * Pre hooks are executed before the hooked method.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5} } );
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
   * Register a hook function.
   * Post hooks are executed after the hooked method.
   * @example
   * ```ts
   *   const schema = new Schema({ amount: { type: Number, default: 5} } );
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
      throw new BuildSchemaError(`The hook '${hook}' is not allowed`);
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

  /**
   * Adds fields/schema type pairs to this schema.
   * @example
   * ```ts
   *   const plane = new Schema({ name: String });
   *   const boeing = new Schema({ price: Number });
   *   boeing.add(plane);
   *
   *   // You can add also add fields to this schema
   *   boeing.add({ status: Boolean });
   * ```
   * @param obj Plain object to add, or another schema
   * @return Schema
   */
  public add(obj: Record<string, unknown> | Schema): Schema {
    if (obj instanceof Schema) {
      this._addSchema(obj);
    } else if (typeof obj === 'object') {
      this._addObject(obj);
    } else {
      throw TypeError('Wrong type, must be Object or Schema');
    }
    return this;
  }

  private _addObject(obj: Record<string, unknown>): void {
    const strict = this.options?.strict || false;
    const objFields = buildFields(obj, strict);
    this.fields = { ...this.fields, ...objFields };
  }

  private _addSchema(obj: Schema): void {
    this.fields = { ...this.fields, ...obj.fields };
    this.queries = { ...this.queries, ...obj.queries };
    this.index = { ...this.index, ...obj.index };
    this.methods = { ...this.methods, ...obj.methods };
    this.statics = { ...this.statics, ...obj.statics };
    this.preHooks = mergeHooks(this.preHooks, obj.preHooks);
    this.postHooks = mergeHooks(this.postHooks, obj.postHooks);
  }
}
