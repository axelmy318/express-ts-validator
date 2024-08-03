import { Response } from "express";
import bodyParser from "body-parser";
import Validator from '../src';

const express = require('express');
const router = express.Router();

const val2 = new Validator({
    myStr: { type: 'string', required: false, case: 'upper' }
});

type reqBody = typeof val2.Schema;

router.get('/list', bodyParser.json(), val2.validate, async (req: Request & { body: typeof val2.Schema; }, res: Response) => {
    console.log(req.body);
});

module.exports = router;