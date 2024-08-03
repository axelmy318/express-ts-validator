import { Dayjs } from "dayjs";

export const matches = {
    email: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    alphanumeric: /^[A-Za-z0-9]*$/,
    alphabetical: /^[A-Za-z]*$/,
    numerical: /^[0-9]*$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    strongPassword: /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/,
    URL: /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})(\/[^\s]*)?$/,
    phone: /^\+?(\d{1,3})?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(\s*x\d{1,5})?$/,
    IPAddress: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    hexColor: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
};

type DefaultRule<T> = T & { required?: boolean; list?: boolean; };

export type StringRule = DefaultRule<{ type: 'string'; notEmpty?: boolean; match?: keyof typeof matches; regExp?: RegExp; }>;
export type DateRule = DefaultRule<{ type: 'date'; format?: string; }>;
export type DateTimeRule = DefaultRule<{ type: 'datetime'; format?: string; }>;
export type BooleanRule = DefaultRule<{ type: 'bool'; }>;
export type NumberRule = DefaultRule<{ type: 'number'; min?: number, max?: number; }>;
export type ObjectRule = DefaultRule<{ type: 'object'; validator: ValidationSchema; }>;

export type Rule = StringRule | NumberRule | BooleanRule | DateRule | DateTimeRule | ObjectRule;

export type ValidationSchema = { [key: string]: Rule; };

type TypeFromRule<T extends Rule> = T['type'] extends 'string'
    ? string
    : T['type'] extends 'number'
    ? number
    : T['type'] extends 'boolean'
    ? boolean
    : T['type'] extends 'datetime'
    ? Dayjs
    : T['type'] extends 'date'
    ? Dayjs
    : T['type'] extends 'object'
    ? InferInterface<T extends ObjectRule ? T['validator'] : {}>
    : any;

export type InferInterface<T extends ValidationSchema> = {
    [K in keyof T]: T[K]['required'] extends false
    ? InferInterfacelist<T[K]> | undefined
    : InferInterfacelist<T[K]>
};

export type InferInterfacelist<T extends Rule> = T['list'] extends true ? TypeFromRule<T>[] : TypeFromRule<T>;