import { NextFunction, Request, Response } from "express";
import * as Types from './types';
export default class Validator<Body extends Record<string, Types.BodyRule>, Param extends Record<string, Types.ParamRule>> {
    private body_keys;
    private param_keys;
    Schema: Types.InferBodyInterface<Body>;
    Request: Request<Types.InferParamInterface<Param>, {}, Types.InferBodyInterface<Body>>;
    constructor(body?: Body, param?: Param);
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
