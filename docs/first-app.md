# Building Your First Ottoman App

This project will show you how to use a Node JS ODM (Object Document Mapper) for Couchbase Server and build our bikeshop application.

## Prepare Couchbase Server

[Download and install Couchbase Server](https://www.couchbase.com/downloads?family=couchbase-server). The enterprise version of the product is free to use in any development capacity or you can opt for the community edition, it's up to you. The latest version can be downloaded from our website. After installation, open your browser to [localhost:8091](https://localhost:8091) to access the Couchbase Server Web UI.

We will walk through the setup process. For this walkthrough and application, we assume Couchbase is installed on the same system the application will be developed on. Be sure to select all three services Data, Index, Query on the “Configure Server” page under “Start a new Cluster”.

![Services Select Diagram](install-screen-sm.png)

Continue through the setup without adding any sample buckets. Once we get to the Web UI dashboard, select the "Buckets" tab and add a bucket named `default`.

## Application Prerequisites

Install Node.js from the [Node.js website](http://nodejs.org/). Once Node.js is installed, we can bootstrap our application.

## Prepare Our Project Folder

Run the following command to clone the repository on GitHub, this will create a directory named `bikeshop-cb` and change directories into our cloned repo.

```bash
git clone https://github.com/couchbaselabs/bikeshop-cb.git && cd bikeshop-cb
```

NOTE: A double ampersand `&&` in the command above simply chains our two synchronous bash commands.

You will see a `package.json` (project manifest) listing our application dependencies.

```json
"dependencies": {
  "express": "*",
  "couchbase": "~2.3.0",
  "body-parser": "*",
  "ottoman":"~1.0.2"
}
```

We need to install these dependencies:

```bash
npm install
```

## Application Requirements

- Inventory application for cataloguing bikes.
- The application must store Customer and Sales Person information to track test rides and purchase information.
- Couchbase will be the system of record.

### Data Model

The flexibility and dynamic nature of JSON and a NoSQL Document Database simplify building data models. We will use three types of objects, we'll define those in specific modules in the node application.

- customers
- employees
- bikes

A folder under the root of the application called `/schema` is where the data model is defined, and in `/schema/model` separate modules for each object are defined. We will walk through each one starting with `customer.js`.

### Customer Model

Each module needs these two lines (it's dependencies):

```javascript
var db = require('./../db.js');       // ← database object
var ottoman = require('ottoman');     // ← ottoman odm
```

We can use custom validator function as part of our model definitions to ensure phone numbers are created in the standard USA format.

```javascript
function PhoneValidator(val) {
  var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if(val && !val.match(phoneno)) {
    throw new Error('Phone number is invalid.');
  }
}
```

The model for the Customer object is defined, using several of the built-in types that Ottoman supports. For additional reference, see the [Ottoman JS documentation](http://www.ottomanjs.com). Several indices are defined along with the model. The indices are utilized as methods for each instance of the Customer Object. Ottoman supports complex data types, embedded references to other models, and customization.  

```javascript
var CustomerMdl = ottoman.model('Customer', {
  customerID: {
    type: 'string',
    auto: 'uuid',                     // ← auto-increment UUID
    readonly: true
    },
  createdON: {
    type: 'Date',
    default: new Date()               // ← auto populate date field
  },
  name: {                             // ← embedded string document
    first: 'string',
    last: 'string'
  },
  address: {                          // ← embedded address document
    street: 'string',
    city: 'string',
    state: 'string',
    zip: 'integer',
    country: {                        // ← auto populate string
      type: 'string',
      default: 'USA'
    }
  },
  phone: {
    type: 'string',
    validator: PhoneValidator         // ← string using custom validator
  },
  email: 'string',
  history: [{                         // ← array of historical events
    date: {
      type: 'Date',
      default:new Date()
    },
    employee: 'Employee',             // ← reference to another ottoman object
    interaction: 'string',
    notes: 'string'
  }],
  active: {
    type: 'boolean',
    default: true
  }
},{
  index: {
    findByCustomerID: {               // ← refdoc index
      by: 'customerID',
      type: 'refdoc'
    },
    findByEmail: {                    // ← refdoc index
      by: 'email',
      type: 'refdoc'
    },
    findByFirstName: {                // ← secondary index
      by: 'name.first'
    },
    findByLastName: {                 // ← secondary index
      by: 'name.last'
    }
  }
});
```

In the Customer model above, there are four explicit indexes defined. By default, if an index type is not specified Ottoman will select the fastest available index supported within the current Couchbase cluster. In addition to utilizing the built-in secondary index support within Couchbase, Ottoman can also utilize reference documents to maintain referential integrity for inserts, updates and deletes. This is a powerful feature that allows for blazingly fast lookups by a particular field. This type of index in Ottoman is useful for finding a particular object by a unique field (customer id or email address in the example above). In addition to any explicit index, Ottoman also provides a generic find capability using the Query API and N1QL.

The next block of code in the Customer model is a function that allows the application to create and save a new instance of a Customer in one step. The method "create" is a default method provided by Ottoman for objects as a convenience.  It's also possible to instantiate a new object, assign all of the fields and then save the object using the `save()` method that Ottoman provides for each object.  An example of doing it this way is included in the Bike Model below. Lastly, the Ottoman model of the Customer is exported for use in other modules.

```javascript
CustomerMdl.createAndSave = function (
    firstname, lastname, addrStreet, addrCity, addrState, addrZip, email, done
  ) {
  this.create({
    name: {
      first: firstname,
      last: lastname
    },
    address: {
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zip: addrZip
    },
    email: email
  }, done);
};

module.exports = CustomerMdl;
```

### Bike Model

The `bike.js` module begins much the same way as the `customer.js` module.

NOTE: Objects that are referenced by other ottoman objects do not need to be declared specifically as node dependencies within other modules. For example, to define a field as a reference in the `Bike` model to the `Customer` model defined above, it's not necessary to include the `customer.js` module as a reference.

```javascript
var db = require('./../db.js');      // ← use the database object
var ottoman = require('ottoman');    // ← use ottoman
```

Just like the Customer model, the Bike model uses multiple data types, embedded references to other Ottoman models and explicitly defined secondary indexes.

```javascript
var BikeMdl = ottoman.model('Bike', {
  stockID: {
    type:'string',
    auto:'uuid',                     // ← auto Increment UUID
    readonly: true
  },
  acquiredON: {
    type: 'Date',
    default: Date.now                // ← auto populate date function
  },
  vin: 'string',
  make: 'string',
  model: 'string',
  year: 'integer',
  description: 'string',
  condition: 'string',
  price: 'number',
  status: 'string',
  mileage: 'integer',
  photos: [{type: 'string'}],        // ← array of strings, URLS to photos
  rides: [{                          // ← array of test rides
    customer: {ref: 'Customer'},     // ← reference to another Ottoman object
    employee: {ref: 'Employee'},     // ← reference to another Ottoman object
    date: 'Date',
    miles: 'number'
  }],
  sale: {                            // ← embedded sale document
    customer: {ref: 'Customer'},     // ← reference to another Ottoman object
    employee: {ref: 'Employee'},     // ← reference to another Ottoman object
    amount: 'number',
    warranty: 'number',
    date: {
      type: 'Date',
      default: Date.now
    }                                 // ← auto populate date function
  }
}, {
  index: {
    findByStockID: {                  // ← refdoc index
      type: 'refdoc',
      by: 'stockID'
    },
    findByMake: {                     // ← secondary index
      by: 'make'
    },
    findByYear: {                     // ← secondary index
      by: 'year'
    },
    findByCondition: {                // ← secondary index
      by: 'condition'
    },
    findByStatus: {                   // ← secondary index
      by: 'status'
    },
    findByVin: {                      // ← refdoc index
      type: 'refdoc',
      by: 'vin'
    }
  }
});
```

Just like in the customer example, there are a mix of `refdoc` indexes and default secondary indexes. Also, a shorthand `create()` and `save()` method are utilized for instantiating new instances of the Bike object.

```javascript
BikeMdl.createAndSave = function(vin, year, make, model, description, condition, mileage, price, done) {
  this.create({
    vin: vin,
    year: year,
    make: make,
    model: model,
    description: description,
    condition: condition,
    mileage: mileage,
    price: price
  }, done);
};
```

An example of the same sequence of instantiating a new object, assigning values to all the fields and then saving the object used in the shorthand function above is shown for reference.

```javascript
BikeMdl.createAndSaveLongform = function(vin, year, make, model, description, condition, mileage, price, done) {
  var bike = new BikeMdl();          // ← create a new object from model
  bike.vin = vin;
  bike.year = year;
  bike.make = make;
  bike.model = model
  bike.description = description;
  bike.condition = condition;
  bike.mileage = mileage;
  bike.price = price;

  bike.save(function(err){           // ← save the object
    if(err) return done(err);
    done(null, bike);
  });
};
```

The Bike module has a special method that is instantiated with each new instance of the Bike object. This method allows adding a test ride to the array of test rides for logging each specific test ride on a specific bike. Lastly, the Bike Model is exported for other modules to use.

```javascript
BikeMdl.prototype.addRide = function(customer, employee, miles, date, done) {
  if (!this.rides) {
    this.rides = [];
  }
  this.rides.push({
    customer: customer,
    employee: employee,
    miles: miles,
    date:date
  });
  this.save(done);
};

module.exports = BikeMdl;
```

### Application and Routing

Now that the models are defined above, the controller functionality is defined in the `app.js` file in the root directory and the `routes.js` file in the `/routes` directory.

#### App Module

The `app.js` file is the entry-point to the application and defines how the application will function. The code within the file is as follows:

```javascript
var express = require('express');    // ← use express
var app = express();                 // ← set express instance
var path = require('path');          // ← setup path service to publish directory

app.use(express.static(              // ↓ publish the static public path
  path.join(__dirname, 'public')
  )
);
require('./routes/routes')(app);     // ← pass the express instance into the routes

app.listen(3000);                    // ← express listen on port 3000
```

### Routes

For the purpose of simplicity, much of the application logic takes place in the route handlers themselves. In a production node application, this functionality would typically be abstracted out along with using middleware to handle things like authentication. Lets look at an example for how new documents are created with the application. The functionality for how a new bike is added into the application is a good place to start, in the `routes.js` module:

```javascript
//// ▶▶ BIKE add new bike ◀◀ ////
app.post('/api/bike/create',jsonParser, function(req,res){
  bike.createAndSave(
    req.body.vin,
    req.body.year,
    req.body.make,
    req.body.model,
    req.body.description,
    req.body.condition,
    req.body.mileage,
    req.body.price,
  function(err,done) {
    if (err) {
      res.status = 400;
      res.send(err.toString());
      return;
    }

    res.status=201;
    res.send(done);
    return;
  });
});
```

Using the createAndSave method defined in the bike.js module allows us to easily add this entry into the database. Once the entry is added we can use the indexes we defined using Ottoman for the Bike Model as methods to query for a list of bikes, or a specific bike. This example in the `routes.js` module uses the refdoc index defined for stockID in the Bike Model:

```javascript
//// ▶▶ BIKE find one◀◀ ////
app.get('/api/bike/findOne/:id',function(req,res) {
  bike.findByStockID(
    req.params.id,
  function(err,stock) {
    if (err) {
      res.status = 400;
      res.send(err);
      return;
    }
    if(stock && stock.length > 0) {
      res.status = 202;
      res.send(stock);
      return;
    } else {
      bike.findByVin( req.params.id, function(err,vin) {
        if (err) {
          res.status = 400;
          res.send(err);
          return;
        }
        if (vin && vin.length > 0) {
          res.status = 202;
          res.send(vin);
          return;
        } else {
          res.status = 202;
          res.send("not found");
          return;
        }
      });
    }
  });
});
```

One of the most powerful features in Couchbase version 4.0 and later, is the query API.  By using N1QL queries we can perform structured queries against JSON documents stored within Couchbase.  Ottoman makes use of this feature by providing a default generic query method for each type of object you defined with an Ottoman model.  The example for how this can be used for the Bike Model is also in the `routes.js` module: 

```javascript
//// ▶▶ BIKE generic find ◀◀ ////
app.get('/api/bike/find', function(req,res) {
  bike.find(req.query, function (err, done) {
    if (err) {
      res.status = 400;
      res.send(err);
      return;
    }
    res.status = 202;
    res.send(done);
  });
});
```

Similar routes and functionality are defined in the routes.js module for the other two Object types we defined in our model (ie: customers and employees). An Object Mapper rapidly speeds up development time and helps to create a powerful pattern language for the application can interact with complex objects while being completely abstracted from the storage layer.  An example for this is the rides array of embedded objects that were defined in the Bike Model. This allows the application to effectively log a list of test rides mapped to the specific customer, specific employee, and stored with each bike.  Using Ottoman to model the objects on top of Couchbase, means not have to worry about how those complex relationships are stored in the storage layer, and not having to write all of that code that extracts and represents those stored items to the application.  

For example, the route that adds a new test ride in the `routes.js` module:

- Checks if the bike exists for the specified VIN number
- Checks if the customer exists for the specified customer email address
- Checks if the employee exists for the specified employee email address
- Adds an entry into the ride history based on the above information, mileage, and ride date

Handling the Object mapping to the storage tier makes life significantly easier and allows for rapid prototyping. Here is the example in the `routes.js` module that performs the above steps:

```javascript
//// ▶▶ BIKE create ride ◀◀ ////
app.post('/api/bike/ride/create', jsonParser, function (req, res) {
  bike.findByVin(req.body.vin, function (err, curBikes) {
    if (err) {
      res.status = 400;
      res.send(err);
      return;
    }
    if (curBikes) {
      customer.findByEmail(
        req.body.custEmail,
        function (err, curCustomers) {
          if (err) {
            res.status = 400;
            res.send(err);
            return;
          }
          if (curCustomers) {
            employee.findByEmail(
              req.body.emplEmail,
              function (err, curEmployees) {
                if (err) {
                  res.status = 400;
                  res.send(err);
                  return;
                }
                if (curEmployees) {
                  curBikes[0].addRide(
                    curCustomers[0],
                    curEmployees[0],
                    req.body.miles,
                    new Date(),
                    function (err) {
                      if (err) {
                        res.status = 400;
                        res.send(err);
                        return;
                      }
                      res.status = 201;
                      res.send(curBikes[0]);
                      return;
                    });
                }
              });
          }
        });
    }
  });
});
```

## Run The Application

To see an actual example of what this looks like with some real data, try running the application and calling the REST API. The examples below use curl, running from a terminal in OSX, with the output piped to a python script "-mjson.tool" for readable JSON.

```bash
## =======================
## First, run the application
## =======================
node app.js

## =======================
## Create a new Bike
## =======================
curl -X POST http://127.0.0.1:3000/api/bike/create -H "Content-Type: application/json" -d '{"vin":"duc-2015SUP899AMZ","year":"2015","make":"Ducati","model":"899 panigale","description":"Italian Extreme Superbike","condition":"new","mileage":"9","price":"16000"}' | python -mjson.tool

## =======================
## Find a bike using generic find
## =======================
curl -X GET http://127.0.0.1:3000/api/bike/find?vin=duc-2015SUP899AMZ | python -mjson.tool

## =======================
## Find a bike using generic find, another example
## =======================
curl -X GET http://127.0.0.1:3000/api/bike/find?make=Ducati | python -mjson.tool

## =======================
## Find a bike by using a RefDoc
## =======================
curl -X GET http://127.0.0.1:3000/api/bike/findOne/duc-2015SUP899AMZ | python -mjson.tool

## =======================
## Create a Customer
## =======================
curl -X POST http://127.0.0.1:3000/api/customer/create -H "Content-Type: application/json" -d '{"firstName":"Todd","lastName":"Greenstein","addrStreet":"4 Yawkey Way","addrCity":"Boston","addrState":"MA","addrZip":"02215","email":"todd@couchbase.com"}'  | python -mjson.tool

## =======================
## Find a customer using generic find
## =======================
curl -X GET http://127.0.0.1:3000/api/customer/find?email=todd@couchbase.com | python -mjson.tool

## =======================
## Find a customer using generic find on an embedded field
## =======================
curl -X GET http://127.0.0.1:3000/api/customer/find?name.first=Todd | python -mjson.tool

## =======================
## Find a customer using generic find on an embedded field, another example
## =======================
curl -X GET http://127.0.0.1:3000/api/customer/find?name.last=Greenstein | python -mjson.tool

## =======================
## Find a customer using RefDoc
## =======================
curl -X GET http://127.0.0.1:3000/api/customer/findOne/todd@couchbase.com | python -mjson.tool

## =======================
## Create another Customer
## =======================
curl -X POST http://127.0.0.1:3000/api/customer/create -H "Content-Type: application/json" -d '{"firstName":"Jeff","lastName":"Morris","addrStreet":"1000 Elysian Park Avenue","addrCity":"Los Angeles","addrState":"CA","addrZip":"90012","email":"jeff@couchbase.com"}'  | python -mjson.tool

## =======================
## Create an Employee
## =======================
curl -X POST http://127.0.0.1:3000/api/employee/create -H "Content-Type: application/json" -d '{"firstName":"Justin","lastName":"Michaels","addrStreet":"1060 West Addison","addrCity":"Chicago","addrState":"IL","addrZip":"60613","soc":"123456789","email":"justin@couchbase.com"}' | python -mjson.tool

## =======================
## Find an Employee using a generic find
## =======================
curl -X GET http://127.0.0.1:3000/api/employee/find?email=justin@couchbase.com | python -mjson.tool

## =======================
## Find an Employee using a generic find on an embedded field
## =======================
curl -X GET http://127.0.0.1:3000/api/employee/find?name.last=Michaels | python -mjson.tool

## =======================
## Find an Employee using a RefDoc
## =======================
curl -X GET http://127.0.0.1:3000/api/employee/findOne/justin@couchbase.com | python -mjson.tool

## =======================
## Create a test ride
## =======================
curl -X POST http://127.0.0.1:3000/api/bike/ride/create -H "Content-Type: application/json" -d '{"emplEmail":"justin@couchbase.com","custEmail":"todd@couchbase.com","vin":"duc-2015SUP899AMZ","miles":"25"}' | python -mjson.tool

## =======================
## Create another test ride from a different customer on the same bike
## =======================
curl -X POST http://127.0.0.1:3000/api/bike/ride/create -H "Content-Type: application/json" -d '{"emplEmail":"justin@couchbase.com","custEmail":"jeff@couchbase.com","vin":"duc-2015SUP899AMZ","miles":"35"}' | python -mjson.tool

## =======================
## Find a list of all test rides for a specific bike.  
## =======================
curl -X GET http://127.0.0.1:3000/api/bike/ride/get/duc-2015SUP899AMZ | python -mjson.tool
```
