import { Response } from "express";
import bodyParser from "body-parser";
import Validator from '../src';

const express = require('express');
const router = express.Router();

const val2 = new Validator({
    myStr: { type: 'string', required: false, case: 'upper' }
}, {
    test: { type: 'string' }
});

type reqBody = typeof val2.Request;

router.get('/list', bodyParser.json(), val2.validate, async (req: typeof val2.Request, res: Response) => {

    console.log(req.body);
});

module.exports = router;