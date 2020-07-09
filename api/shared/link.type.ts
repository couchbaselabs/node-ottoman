import { IOttomanType, ValidationError, registerType } from '../../lib';

/**
 * Custom type to manage the links
 */
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

/**
 * Factory function
 * @param name of field
 */
export const linkTypeFactory = (name) => new LinkType(name);

/**
 * Register type on Schema Supported Types
 */
registerType(LinkType.name, linkTypeFactory);

/**
 * Check if value is a valid Link
 * @param value
 */
const isLink = (value: string) => {
  const regExp = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
  );
  return regExp.test(value);
};
