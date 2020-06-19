import { IOttomanType, ValidationError, registerType } from '../../lib';

export class LinkType implements IOttomanType {
  typeName = 'Link';
  constructor(public name) {}
  cast(value: unknown) {
    if (!isLink(String(value))) {
      throw new ValidationError(`Field ${this.name} only allows a Link`);
    }
    return String(value);
  }
}

export const linkTypeFactory = (name) => new LinkType(name);

registerType(LinkType.name, linkTypeFactory);

const isLink = (value: string) => {
  const regExp = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
  );
  return regExp.test(value);
};
