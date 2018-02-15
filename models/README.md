persistence-god
===============================
# The God of Data Base persistence #
---------------------------------------------

## Requiriments
  * [NodeJS](https://nodejs.org)
  * [MongooseJS](http://mongoosejs.com)

---------------------------------------------
---------------------------------------------
---------------------------------------------

## Sample of persistence-god

### Javascript
```
const database = require('persistence-god/lib/database')
const connection = require('persistence-god')
database('mongodb://localhost/name-of-database', connection.init)
```

### ES6
```
import database from 'persistence-god/lib/database'
import {init} from 'persistence-god'
database('mongodb://localhost/name-of-database', init)
```
