/// <reference types="couchbase" />

import { Bucket, CouchbaseError  } from "couchbase";

declare namespace OttomanJS {
  class StoreAdapter {
    constructor (bucket: Bucket)
    store (key: string, data: object, cas: object, callback: any): any
  }

  class CbStoreAdapter {
    constructor (bucket: Bucket)
    store (key: string, data: object, cas: object, callback: any): any
  }

  interface Model {
  }

  interface TypeDef {
  }

  interface OttomanOptions {
    bucket?: Bucket
    store?: StoreAdapter
    namespace?: string
  }

  interface Schema {

  }

  interface Indices {
  }

  interface GetByIdOptions {
  }

  interface CreateOptions {
  }

  type CreateCallback = (error: CouchbaseError | null, document: ModelInstance | undefined) => void
    type GetByIdCallback = (error: CouchbaseError | null, model: ModelInstance | undefined) => void
    type SaveCallback = (error: CouchbaseError | null, response: ModelInstance | undefined) => void

    export interface ModelInstance {
      save (callback: SaveCallback): void
    }

  interface Model {
    getById (id: string, options: GetByIdOptions | undefined, callback: GetByIdCallback): void
    create (id: object, callback: CreateCallback): void
  }

  class Ottoman {
    bucket: Bucket
    readonly namespace: string
    readonly store: StoreAdapter
    readonly models: { [key: string]: Model }
    readonly types: { [key: string]: TypeDef | undefined }
    readonly delayedBind: { [key: string]: Function | undefined }
    readonly plugins: Array<[Function, object]>

    constructor (options: OttomanOptions)

    model (key: string, schema: Schema, index: Indices): Model
  }
}

export = OttomanJS
