/// <reference types="couchbase" />

import { Bucket, CouchbaseError } from "couchbase";

declare namespace OttomanJS {
  class StoreAdapter {
    constructor (bucket: Bucket)
    store (key: string, data: object, cas: object, callback: any): any
  }

  class CbStoreAdapter {
    constructor (bucket: Bucket)
    store (key: string, data: object, cas: object, callback: any): any
  }

  interface TypeDef {
  }

  interface OttomanOptions {
    bucket?: Bucket
    store?: StoreAdapter
    namespace?: string
  }

  interface ModelReference {
    ref: string
  }

  type ValidatorFunction = (value: any) => void
  interface SchemaField {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'Date' | 'Mixed' | ModelReference,
    auto: 'uuid',
    readonly: boolean,
    validator: ValidatorFunction,
    default: boolean | Date | string | number | null
  }

  interface SchemaDefinition {
    [key: string]: Partial<SchemaField>
  }

  interface Schema {
    validate<T> (modelInstance: ModelInstance<T>, callback: ValidationCallback<T>): void
  }

  interface ModelOptions {
    index?: IndexDefinition
    query?: QueryDefinition
  }

  interface Query {
    of: string
    by: string
  }

  interface QueryDefinition {
    [key: string]: Query
  }

  interface Index {
    type: 'refdoc' | 'view' | 'n1ql',
    by: string
  }

  interface IndexDefinition {
    [key: string]: Partial<Index>
  }

  interface GetByIdOptions {
  }

  interface CreateOptions {
  }

  type CreateCallback<T> = (error: CouchbaseError | null, document: ModelInstance<T> | undefined) => void
  type GetByIdCallback<T> = (error: CouchbaseError | null, model: ModelInstance<T> | undefined) => void
  type SaveCallback<T> = (error: CouchbaseError | null, response: ModelInstance<T> | undefined) => void
  type ValidationCallback<T> = (error: CouchbaseError | null) => void
  type EnsureIndicesCallback = (error: CouchbaseError | null) => void

  class ModelInstance<T> {
    fromData<T> (data: any): T
    getById<T> (id: string, callback: GetByIdCallback<T>): void
    create<T> (data: any, callback: CreateCallback<T>): void
    save (callback: SaveCallback<T>): void
  }

  interface ModelInstanceCtor {
    schema: Schema
  }

  class Ottoman {
    bucket: Bucket
    readonly namespace: string
    readonly store: StoreAdapter
    readonly models: { [key: string]: ModelInstance<any> }
    readonly types: { [key: string]: TypeDef | undefined }
    readonly delayedBind: { [key: string]: Function | undefined }
    readonly plugins: Array<[Function, object]>

    constructor (options: OttomanOptions)

    model (key: string, schema: SchemaDefinition, options: ModelOptions): ModelInstanceCtor
    ensureIndices (DeferBuild: boolean, callback: Function): void
  }
}

export = OttomanJS
