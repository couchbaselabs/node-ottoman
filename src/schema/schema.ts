export const validateSchema = (data, schema) => {
  let errors: string[] = [];
  errors = [...errors, ...validateType(data, schema)];
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  return true;
};

const validateType = (data, schema) => {
  const errors: string[] = [];
  for (const key in schema) {
    const schemaType = schema[key].name || schema[key].constructor.name;
    const value = data[key];
    // works for String, Number, Boolean, Date, Class, Array (just type array check element types below)
    if (schemaType !== value.constructor.name) {
      errors.push(`Property ${key} must be type ${schemaType}`);
    }
    if (schemaType === 'Array') {
      const schemaTypeValue = schema[key][0].name;
      for (const [i, element] of value.entries()) {
        if (schemaTypeValue !== element.constructor.name) {
          errors.push(
            `Property "${key}" array values must be all type [${schemaTypeValue}], check value -> ${element} at index ${i}`,
          );
        }
      }
    }
  }
  return errors;
};
