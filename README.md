# Waiter Availability Web Application

If you're looking for an application that will assist with managing shifts, then you have come to the right place.

# Consumer Section

## Employees

Employees can use the application to select shifts for the days on which they will be available to work, or for days
on which they would prefer to work.

### Usage:


1. Go to the application's landing page:

``` 
http://waiter-availability-webapp.herokuapp.com 
```

2. Log in or create an account.

  * If you don't have an account yet, create an account by clicking on the "Register" button. On the registration page, input
your desired credentials. (For your manager's convenience, use your real name and surname as an account name)

  * If you do have an account, use your credentials to log in.

3. Check the boxes for the days on which you would prefer to work for the week.

4. Submit your choices by clicking on the submit button.

## Managers

Managers can quickly see an overview of the week by accessing the '/admin' page. Days which are under-staffed will be
coloured yellow, days that have an adequate amount of staff will be coloured green, and days for which too many waiters
have subscribed will be coloured red.

Managers can use this data in order to assist them in making decisions that pertain to shift delegation.

### Usage:

1. Go to the application's landing page:

``` 
http://waiter-availability-webapp.herokuapp.com 
```

2. Log in or register an admin account.

  * Log in using the username "admin", along with the designated admin password.

  * If an admin account has not yet been created, click on the "Register" button in order to create an account. The account username must be "admin" in order to access the manager dashboard. The password can be anything.

3. View your waiters' shifts.

# Developer Section

Want to contribute to and/or extend the application? Then this section's for you!

## Prerequisites

* [Node & npm](https://nodejs.org/en/) must be installed.
* [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) must be installed.

## Installation Guide

1. Fork the repository.

2. Clone the repository onto your dev machine.

3. Navigate to the project root directory.

4. Run ``` npm install ``` in the project root. This will install all dependencies that are included in the package.json.

  Tools that are included in this app are:
  * Mongoose
  * ExpressJS
  * Express Handlebars
  * Express Static
  * Body Parser

5. To run tests, you will need to install [Mocha](https://mochajs.org/#installation). This will allow you to run the ` mocha `
command in the terminal in order to run your unit tests.

6. Run ``` npm install nodemon ``` to install nodemon. This will allow you to run the express server by using the command 
` nodemon ` in your terminal while in the project's root.

## Using MongoDB

### Start the Mongo shell

The following steps will allow you to get your Mongo client shell running.

1. Install [MongoDB](https://docs.mongodb.com/manual/administration/install-community/).

2. Run the ` mongod ` command in your terminal to start the Mongo DB process/service.

3. Start the Mongo client. You can do this by running ` mongo ` in the terminal.

4. You can now interact with your databases using the Mongo shell.

### Tinkering with MongoDB

One of the best ways to learn a new technology is to tinker with it. Now that your mongo shell is running, you'll
be querying in no time!

1. Check your databases by running ` show dbs ` in the Mongo shell. You should see the database that has been created
by the Waiter Web App if you have run the server before.

2. To use this project's database, you can run ` use waiter_webapp `

3. You can now view any collections in the database. If you're from the SQL world, collections are kind of like tables. Not identical, but similar...

For the Waiter WebApp, you will notice that there are two collections - Available Shifts and Waiters.

4. Now that you know the collection names, you can start querying!

 * Want to see all the waiter data? Run ` db.waiters.find({}) `
 * Want to remove all the waiter data? Run ` db.waiters.remove({}) `
 
5. You can read more information about Mongo queries [here](https://docs.mongodb.com/).
