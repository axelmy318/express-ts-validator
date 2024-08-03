import { Response } from "express";
import bodyParser from "body-parser";
import Validator from '../src';

const express = require('express');
const router = express.Router();

const val2 = new Validator({
    testdd: { type: 'number', min: 10, max: 1000, allowFloat: false },
    email: { type: 'string', match: 'email' }
});

type reqBody = typeof val2.Schema;

router.get('/list', bodyParser.json(), val2.validate, async (req: Request & { body: typeof val2.Schema; }, res: Response) => {
    console.log(req.body);
});

module.exports = router;