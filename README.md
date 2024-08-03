# express-ts-validator 👋
☑ Very easy-to-use package

☑ Highly customizable validators

☑ Automatically generated types & interfaces

## Installation 
`npm i express-ts-validator`


## Guides & examples 👀

[https://axelmry.com/express-ts-validator](https://axelmry.com/express-ts-validator)


## Usage 💻

```typescript
import Validator from 'express-ts-validator'

const userEdit = new Validator({
    name: { type: 'string', notEmpty: true },
    email: { type: 'string', match: 'email', required: true },
    birthdate: { type: 'date', format: 'YYYY-MM-DD' },
    hobbies: { type: 'string', list: true },
    pets: {
        type: 'object', 
        list: true, 
        validator: {
            name: { type: 'string' },
            isNice: { type: 'bool' },
            age: { type: 'number', required: false }
        }
    } 
});

router.post('user/:id/edit', bodyParser.json(), userEdit.validate, (req: Request & { body: typeof userEdit.Schema }, res: Response) => {
    console.log(req.body.pets.map(p => `${p.name} is ${p.isNice ? 'nice' : 'naughty'}`))
    res.status(200).send('The entire request body is automatically typed !')
})

```

## API

Here is a list of all the available parameters for the validation schema

| For type | Name | Default | Description
--- | --- | --- | ---
Any | required | true | Is the field required ? Will throw an error if not present
Any | list | false | Is it a list of values or a single value
String | notEmpty | false | True throws an error if an empty string is given. Does not make the field required
String | match | *none*| Throws an error if the given value doesn't match the premade regular expression
String | regExp | *none* | Throws an error if the given value doesn't match the specified regular expression
String | case | *none* | Converts the string to lower or upper case. Does not throw an error, use match / regExp for that.
Date | format | 'YYYY-MM-DD' | Throws an error if the given value doesn't match that format
Datetime | format | 'YYYY-MM-DD HH:mm:ss' | Throws an error if the given value doesn't match that format
Number | min | *none* | Throws an error if the given number is lower that min value
Number | max | *none* | Throws an error if the given number is greater that min value
Number | allowFloat | true | False throws an error if a floating number if given
Object | validator | *none* | The validation schema of the object

## TODO List
- [x] Support for list validation
- [x] Support for objects validation
- [x] Ability to match on regex for string types
- [x] Min and max values for numbers
- [ ] Support for momentjs (choosing between dayjs and momentjs)
