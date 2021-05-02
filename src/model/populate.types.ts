export type FieldsBaseType = string | string[];
export type PopulateSelectBaseType = { select?: FieldsBaseType; populate?: PopulateFieldsType };
export type PopulateSelectType = { [K: string]: PopulateSelectBaseType };
export type PopulateFieldsType = FieldsBaseType | PopulateSelectType;
