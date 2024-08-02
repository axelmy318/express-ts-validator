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
    age: { type: 'number', required: false },
    birthdate: { type: 'date', format: 'YYYY-MM-DD' },
    hobbies: { type: 'string', list: true },
    pets: {
        type: 'object', 
        list: true, 
        validator: {
            name: { type: 'string' },
            isNice: { type: 'bool' }
        }
    } 
});

router.post('user/:id/edit', bodyParser.json(), userEdit.validate, (req: Request & { body: typeof userEdit.schema }, res: Response) => {
    console.log(req.body.pets.map(p => `${p.name} is ${p.isNice ? 'nice' : 'naughty'}`))
    res.status(200).send('The entire request body is automatically typed !')
})

```
## Checklist
- [x] Support for list validation
- [x] Support for objects validation
- [ ] Support for momentjs (choosing between dayjs and momentjs)