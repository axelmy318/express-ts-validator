
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";
import * as Types from './types.js';

const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

export default class Validator<Body extends Record<string, Types.Rule>> {
    private body_keys: Body;

    // Make a "body" variable, a "param" variable", etc...
    public Request: Request & { body: Types.InferInterface<Body>; };
    public schema: Types.InferInterface<Body>;

    constructor(keys: Body) {
        this.body_keys = keys;
    }

    public validate = (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedPayload = this.validate_keys(this.body_keys, req.body);

            req.body = validatedPayload;
            // res.send(req.body);
            // return;
            return next();
        } catch (e) {
            if (e instanceof ValidationError)
                res.status(400).send({ code: 400, message: e.toString() });
            else
                res.status(500).send();
            return;
        }
    };

    private validate_keys = (keys: Types.ValidationSchema, dataset: Object) => {
        const keys_key = Object.keys(keys);

        const validObj = {};
        for (const k of keys_key)
            validObj[k] = this.validate_key(k, keys[k], dataset !== undefined ? dataset[k] : undefined);

        return validObj;
    };

    private validate_key = (key: string, rule: Types.Rule, value: any) => {
        let processed_val: any;
        const required = rule.required === undefined || rule.required;

        if (required && value === undefined)
            throw new ValidationError(key, rule, value, `missing required parameter of type '(${rule.type})'`);

        if (rule.required !== undefined && rule.required === false)
            return undefined;

        if (rule.list) {
            this.checkArray(rule, key, value);
            return (value as []).map(v => this.validate_key(key, { ...rule, list: false }, v));
        }

        switch (rule.type) {

            case 'string':
                this.checkString(rule, key, value);
                processed_val = value;
                break;

            case 'number':
                processed_val = parseInt(value);
                this.checkNumber(rule, key, processed_val);
                break;

            case 'bool':
                this.checkBoolean(rule, key, value);
                processed_val = Boolean(value);
                break;

            case 'date':
                this.checkDate(rule, key, value);
                processed_val = dayjs(value, rule.format ?? DEFAULT_DATE_FORMAT);
                break;

            case 'datetime':
                this.checkDateTime(rule, key, value);
                processed_val = dayjs(value, rule.format ?? DEFAULT_DATETIME_FORMAT);
                break;

            case 'object':
                processed_val = this.validate_keys(rule.validator, value);
                break;

            default:
                throw new ValidationError(key, rule, value, `got an unexpected value type`);

        }

        return processed_val;
    };


    private send_invalid_value = (key: string, rule: Types.Rule, value: any) => {
        throw new ValidationError(key, rule, value, `invalid value for type '${rule.type}'`);
    };

    private isBoolean = (value) => value === true || value === false || toString.call(value) === '[object Boolean]';

    //#region Validation of inputs
    private checkBoolean = (rule: Types.BooleanRule, key: string, value: any): boolean => {
        if (!this.isBoolean(value))
            return this.send_invalid_value(key, rule, value);

        return true;
    };

    private checkNumber = (rule: Types.NumberRule, key: string, value: number): boolean => {
        if (Number.isNaN(value))
            return this.send_invalid_value(key, rule, value);

        return true;
    };

    private checkString = (rule: Types.StringRule, key: string, value: any): boolean => {
        if (value !== undefined && typeof value !== typeof 'string')
            return this.send_invalid_value(key, rule, value);
        if (rule.notEmpty && value === '')
            return this.send_invalid_value(key, rule, value);

        return true;
    };

    private checkDate = (rule: Types.DateRule, key: string, value: any): boolean => {
        if (!dayjs(value, rule.format ?? DEFAULT_DATE_FORMAT, true).isValid())
            return this.send_invalid_value(key, rule, value);

        return true;
    };

    private checkDateTime = (rule: Types.DateTimeRule, key: string, value: any): boolean => {
        if (!dayjs(value, rule.format ?? DEFAULT_DATETIME_FORMAT, true).isValid())
            return this.send_invalid_value(key, rule, value);

        return true;
    };

    private checkArray = (rule: Types.Rule, key: string, value: any): boolean => {
        if (!Array.isArray(value))
            throw new ValidationError(key, rule, value, `Expected a list of '${rule.type}'`);

        return true;
    };

    //#endregion
}

//#region Error
class ValidationError extends Error {
    key: string;
    rule: Types.Rule;
    value: any;
    reason: string;

    constructor(key: string, rule: Types.Rule, value: any, reason: string) {
        super(`Error occurred. Key: ${key}, Reason: ${value}`);

        this.name = 'Validation error';

        this.key = key;
        this.rule = rule;
        this.value = value;
        this.reason = reason;

        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    toString = () => `'${this.key}': ${this.reason}`;
}

//#endregion