import { Dayjs } from "dayjs";
export declare const matches: {
    email: RegExp;
    alphanumeric: RegExp;
    alphabetical: RegExp;
    numerical: RegExp;
    UUID: RegExp;
    strongPassword: RegExp;
    URL: RegExp;
    phone: RegExp;
    IPAddress: RegExp;
    hexColor: RegExp;
};
type DefaultRule<T> = T & {
    required?: boolean;
    list?: boolean;
};
export type StringRule = DefaultRule<{
    type: 'string';
    notEmpty?: boolean;
    match?: keyof typeof matches;
    regExp?: RegExp;
}>;
export type DateRule = DefaultRule<{
    type: 'date';
    format?: string;
}>;
export type DateTimeRule = DefaultRule<{
    type: 'datetime';
    format?: string;
}>;
export type BooleanRule = DefaultRule<{
    type: 'bool';
}>;
export type NumberRule = DefaultRule<{
    type: 'number';
    min?: number;
    max?: number;
    allowFloat?: boolean;
}>;
export type ObjectRule = DefaultRule<{
    type: 'object';
    validator: ValidationSchema;
}>;
export type Rule = StringRule | NumberRule | BooleanRule | DateRule | DateTimeRule | ObjectRule;
export type ValidationSchema = {
    [key: string]: Rule;
};
type TypeFromRule<T extends Rule> = T['type'] extends 'string' ? string : T['type'] extends 'number' ? number : T['type'] extends 'boolean' ? boolean : T['type'] extends 'datetime' ? Dayjs : T['type'] extends 'date' ? Dayjs : T['type'] extends 'object' ? InferInterface<T extends ObjectRule ? T['validator'] : {}> : any;
export type InferInterface<T extends ValidationSchema> = {
    [K in keyof T]: T[K]['required'] extends false ? InferInterfacelist<T[K]> | undefined : InferInterfacelist<T[K]>;
};
export type InferInterfacelist<T extends Rule> = T['list'] extends true ? TypeFromRule<T>[] : TypeFromRule<T>;
export {};
