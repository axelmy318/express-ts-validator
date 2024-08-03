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

router.post('user/:id/edit', bodyParser.json(), userEdit.validate, (req: typeof userEdit.Request, res: Response) => {
    console.log(req.body.pets.map(p => `${p.name} is ${p.isNice ? 'nice' : 'naughty'}`))
    res.status(200).send('The entire request body is automatically typed !')
})

```
## Checklist
- [x] Support for list validation
- [x] Support for objects validation
- [x] Ability to match on regex for string types
- [x] Min and max values for numbers
- [ ] Support for momentjs (choosing between dayjs and momentjs)