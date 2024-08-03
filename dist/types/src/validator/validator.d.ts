import { NextFunction, Request, Response } from "express";
import * as Types from './types';
export default class Validator<Body extends Record<string, Types.Rule>> {
    private body_keys;
    Request: Request & {
        body: Types.InferInterface<Body>;
    };
    schema: Types.InferInterface<Body>;
    constructor(keys: Body);
    validate: (req: Request, res: Response, next: NextFunction) => any;
    private validate_keys;
    private validate_key;
    private send_invalid_value;
    private isBoolean;
    private checkBoolean;
    private checkNumber;
    private checkString;
    private checkDate;
    private checkDateTime;
    private checkArray;
}
