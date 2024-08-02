"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
class Validator {
    constructor(keys) {
        this.validate = (req, res, next) => {
            try {
                const validatedPayload = this.validate_keys(this.body_keys, req.body);
                req.body = validatedPayload;
                // res.send(req.body);
                // return;
                return next();
            }
            catch (e) {
                if (e instanceof ValidationError)
                    res.status(400).send({ code: 400, message: e.toString() });
                else
                    res.status(500).send();
                return;
            }
        };
        this.validate_keys = (keys, dataset) => {
            const keys_key = Object.keys(keys);
            const validObj = {};
            for (const k of keys_key)
                validObj[k] = this.validate_key(k, keys[k], dataset !== undefined ? dataset[k] : undefined);
            return validObj;
        };
        this.validate_key = (key, rule, value) => {
            var _a, _b;
            let processed_val;
            const required = rule.required === undefined || rule.required;
            if (required && value === undefined)
                throw new ValidationError(key, rule, value, `missing required parameter of type '(${rule.type})'`);
            if (rule.required !== undefined && rule.required === false)
                return undefined;
            if (rule.list) {
                this.checkArray(rule, key, value);
                return value.map(v => this.validate_key(key, Object.assign(Object.assign({}, rule), { list: false }), v));
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
                    processed_val = (0, dayjs_1.default)(value, (_a = rule.format) !== null && _a !== void 0 ? _a : DEFAULT_DATE_FORMAT);
                    break;
                case 'datetime':
                    this.checkDateTime(rule, key, value);
                    processed_val = (0, dayjs_1.default)(value, (_b = rule.format) !== null && _b !== void 0 ? _b : DEFAULT_DATETIME_FORMAT);
                    break;
                case 'object':
                    processed_val = this.validate_keys(rule.validator, value);
                    break;
                default:
                    throw new ValidationError(key, rule, value, `got an unexpected value type`);
            }
            return processed_val;
        };
        this.send_invalid_value = (key, rule, value) => {
            throw new ValidationError(key, rule, value, `invalid value for type '${rule.type}'`);
        };
        this.isBoolean = (value) => value === true || value === false || toString.call(value) === '[object Boolean]';
        //#region Validation of inputs
        this.checkBoolean = (rule, key, value) => {
            if (!this.isBoolean(value))
                return this.send_invalid_value(key, rule, value);
            return true;
        };
        this.checkNumber = (rule, key, value) => {
            if (Number.isNaN(value))
                return this.send_invalid_value(key, rule, value);
            return true;
        };
        this.checkString = (rule, key, value) => {
            if (value !== undefined && typeof value !== typeof 'string')
                return this.send_invalid_value(key, rule, value);
            if (rule.notEmpty && value === '')
                return this.send_invalid_value(key, rule, value);
            return true;
        };
        this.checkDate = (rule, key, value) => {
            var _a;
            if (!(0, dayjs_1.default)(value, (_a = rule.format) !== null && _a !== void 0 ? _a : DEFAULT_DATE_FORMAT, true).isValid())
                return this.send_invalid_value(key, rule, value);
            return true;
        };
        this.checkDateTime = (rule, key, value) => {
            var _a;
            if (!(0, dayjs_1.default)(value, (_a = rule.format) !== null && _a !== void 0 ? _a : DEFAULT_DATETIME_FORMAT, true).isValid())
                return this.send_invalid_value(key, rule, value);
            return true;
        };
        this.checkArray = (rule, key, value) => {
            if (!Array.isArray(value))
                throw new ValidationError(key, rule, value, `Expected a list of '${rule.type}'`);
            return true;
        };
        this.body_keys = keys;
    }
}
exports.default = Validator;
//#region Error
class ValidationError extends Error {
    constructor(key, rule, value, reason) {
        super(`Error occurred. Key: ${key}, Reason: ${value}`);
        this.toString = () => `'${this.key}': ${this.reason}`;
        this.name = 'Validation error';
        this.key = key;
        this.rule = rule;
        this.value = value;
        this.reason = reason;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
//#endregion
