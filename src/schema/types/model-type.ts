import { CoreType } from './core-type';
import { Model } from '../../model/model';
import { isModel } from '../../utils/is-model';

class ModelType extends CoreType {
  constructor(name: string, public byRef: boolean) {
    super(name, Model);
  }
  async applyValidations(value): Promise<string[]> {
    await value._validate();
    return [];
  }

  isEmpty(value: Model): boolean {
    return false;
  }

  checkType(value: unknown): string[] {
    return !isModel(value) ? [`Property ${this.name} must be type Model`] : [];
  }
}

export const modelTypeFactory = (name: string, byRef: boolean) => new ModelType(name, byRef);
