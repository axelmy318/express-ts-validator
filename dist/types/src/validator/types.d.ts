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
    MACAddress: RegExp;
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
    validator: ValidationSchema<BodyRule>;
}>;
export type WithoutRequired<T> = Omit<T, 'required'>;
export type Rule = StringRule | NumberRule | BooleanRule | DateRule | DateTimeRule | ObjectRule;
export type BodyRule = StringRule | NumberRule | BooleanRule | DateRule | DateTimeRule | ObjectRule;
export type ParamRule = WithoutRequired<StringRule>;
export type ValidationSchema<T extends Rule | BodyRule | ParamRule> = {
    [key: string]: T;
};
type TypeFromRule<T extends BodyRule | ParamRule> = T['type'] extends 'string' ? string : T['type'] extends 'number' ? number : T['type'] extends 'boolean' ? boolean : T['type'] extends 'datetime' ? Dayjs : T['type'] extends 'date' ? Dayjs : T['type'] extends 'object' ? InferBodyInterface<T extends ObjectRule ? T['validator'] : {}> : any;
export type InferBodyInterface<T extends ValidationSchema<BodyRule>> = {
    [K in keyof T]: T[K]['required'] extends false ? InferInterfaceList<T[K]> | undefined : InferInterfaceList<T[K]>;
};
export type InferParamInterface<T extends ValidationSchema<ParamRule>> = {
    [K in keyof T]: InferInterfaceList<T[K]>;
};
type InferInterfaceList<T extends BodyRule | ParamRule> = T['list'] extends true ? TypeFromRule<T>[] : TypeFromRule<T>;
export {};
