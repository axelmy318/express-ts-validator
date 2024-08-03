"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const Types = __importStar(require("./types"));
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
            const required = rule.required !== false;
            if (required && value === undefined)
                throw new ValidationError(key, rule, value, `missing required parameter of type '(${rule.type})'`);
            if (!required && value === undefined)
                return undefined;
            if (rule.list) {
                this.checkArray(rule, key, value);
                return value.map(v => this.validate_key(key, Object.assign(Object.assign({}, rule), { list: false }), v));
            }
            switch (rule.type) {
                case 'string':
                    this.checkString(rule, key, value);
                    processed_val = this.processStringRule(rule, key, value);
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
        //#region Processing of inputs
        this.processStringRule = (rule, key, value) => {
            const processed_val = value;
            if (rule.case) {
                switch (rule.case) {
                    case 'lower':
                        processed_val.toLowerCase();
                        break;
                    case 'upper':
                        processed_val.toUpperCase();
                        break;
                    default:
                        break;
                }
            }
            return processed_val;
        };
        //#endregion
        //#region Validation of inputs
        this.checkBoolean = (rule, key, value) => {
            if (!this.isBoolean(value))
                this.send_invalid_value(key, rule, value);
        };
        this.checkNumber = (rule, key, value) => {
            if (Number.isNaN(value))
                this.send_invalid_value(key, rule, value);
            if (rule.max !== undefined && value > rule.max)
                throw new ValidationError(key, rule, value, `cannot be greater than ${rule.max}`);
            if (rule.min !== undefined && value < rule.min)
                throw new ValidationError(key, rule, value, `cannot be lower than ${rule.min}`);
            if (rule.allowFloat === false && value % 1 !== 0)
                throw new ValidationError(key, rule, value, `floats not allowed`);
        };
        this.checkString = (rule, key, value) => {
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
        this.checkDate = (rule, key, value) => {
            var _a;
            if (!(0, dayjs_1.default)(value, (_a = rule.format) !== null && _a !== void 0 ? _a : DEFAULT_DATE_FORMAT, true).isValid())
                this.send_invalid_value(key, rule, value);
        };
        this.checkDateTime = (rule, key, value) => {
            var _a;
            if (!(0, dayjs_1.default)(value, (_a = rule.format) !== null && _a !== void 0 ? _a : DEFAULT_DATETIME_FORMAT, true).isValid())
                this.send_invalid_value(key, rule, value);
        };
        this.checkArray = (rule, key, value) => {
            if (!Array.isArray(value))
                throw new ValidationError(key, rule, value, `Expected a list of '${rule.type}'`);
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
