import {validateSchema} from "..";
import { save } from "../handler/save";

export class ModelBase {
    constructor(public __data, public __collection, public __schema) {}

    save(key) {
        validateSchema(this.__data, this.__schema);
        return save(key, this.__data, this.__collection);
    }
}