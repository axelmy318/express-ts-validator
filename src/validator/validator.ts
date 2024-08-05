
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";
import * as Types from './types';

const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

export default class Validator<Body extends Record<string, Types.BodyRule>, Param extends Record<string, Types.ParamRule>> {
    private body_keys: Body;
    private param_keys: Param;

    public Schema: Types.InferBodyInterface<Body>;
    public Request: Request<Types.InferParamInterface<Param>, {}, Types.InferBodyInterface<Body>>;

    constructor(body?: Body, param?: Param) {
        if (body)
            this.body_keys = body;
        if (param)
            this.param_keys = param;
    }

    public validate = (req: Request, res: Response, next: NextFunction) => {
        try {
            if (this.body_keys !== undefined) {
                const validatedPayload = this.validate_keys(this.body_keys, req.body);
                req.body = validatedPayload;
            }

            if (this.param_keys !== undefined) {
                const validatedParams = this.validate_keys(this.param_keys, req.params);
                req.params = validatedParams;
            }

            return next();
        } catch (e) {
            if (e instanceof ValidationError)
                res.status(400).send({ code: 400, message: e.toString() });
            else
                res.status(500).send();
            return;
        }
    };

    private validate_keys = (keys: Types.ValidationSchema<Types.Rule>, dataset: Object) => {
        const keys_key = Object.keys(keys);

        const obj = {};
        for (const k of keys_key)
            obj[k] = this.validate_key(k, keys[k], dataset !== undefined ? dataset[k] : undefined);

        return obj;
    };

    private validate_key = (key: string, rule: Types.Rule, value: any) => {
        let processed_val: any;
        const required = rule.required !== false;

        if (required && value === undefined)
            throw new ValidationError(key, rule, value, `missing required parameter of type '(${rule.type})'`);

        if (!required && value === undefined)
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
                processed_val = parseFloat(value);
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
    private checkBoolean = (rule: Types.BooleanRule, key: string, value: any) => {
        if (!this.isBoolean(value))
            this.send_invalid_value(key, rule, value);
    };

    private checkNumber = (rule: Types.NumberRule, key: string, value: number) => {
        if (Number.isNaN(value))
            this.send_invalid_value(key, rule, value);

        if (rule.max !== undefined && value > rule.max)
            throw new ValidationError(key, rule, value, `cannot be greater than ${rule.max}`);

        if (rule.min !== undefined && value < rule.min)
            throw new ValidationError(key, rule, value, `cannot be lower than ${rule.min}`);

        if (rule.allowFloat === false && value % 1 !== 0)
            throw new ValidationError(key, rule, value, `floats not allowed`);
    };

    private checkString = (rule: Types.StringRule, key: string, value: any) => {
        if (value !== undefined && typeof value !== typeof 'string')
            this.send_invalid_value(key, rule, value);
        if (rule.notEmpty && value === '')
            this.send_invalid_value(key, rule, value);

        if (rule.regExp && rule.match)
            throw new ValidationError(key, rule, value, `regExp and match cannot both be defined at the same time.`);

        const expression = rule.regExp ? rule.regExp : rule.match ? Types.matches[rule.match] : undefined;

        if (expression && !expression.test(value))
            throw new ValidationError(key, rule, value, `value does not match given RegExp`);
    };

    private checkDate = (rule: Types.DateRule, key: string, value: any) => {
        if (!dayjs(value, rule.format ?? DEFAULT_DATE_FORMAT, true).isValid())
            this.send_invalid_value(key, rule, value);
    };

    private checkDateTime = (rule: Types.DateTimeRule, key: string, value: any) => {
        if (!dayjs(value, rule.format ?? DEFAULT_DATETIME_FORMAT, true).isValid())
            this.send_invalid_value(key, rule, value);
    };

    private checkArray = (rule: Types.Rule, key: string, value: any) => {
        if (!Array.isArray(value))
            throw new ValidationError(key, rule, value, `Expected a list of '${rule.type}'`);
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