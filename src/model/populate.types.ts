export type FieldsBaseType = string | string[];
export type PopulateSelectBaseType = { select?: FieldsBaseType; populate?: PopulateFieldsType };
export type PopulateSelectType = { [K: string]: FieldsBaseType | PopulateSelectBaseType };
export type PopulateFieldsType = FieldsBaseType | PopulateSelectType;

export type PopulateOptionsType = { deep?: number; lean?: boolean; enforceRefCheck?: boolean | 'throw' };
