const fs = require('fs');
require('colors');
const dotenv = require('dotenv').config();
const User = require('./models/User');
const Member = require('./models/Member');
const path = require('path');
const connectDB = require('./db/connect');

// connect to DB
connectDB(process.env.MONGO_URL);

// Read data
const filePath = path.join(__dirname, 'mokData/file.json');
const members = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Insert data into DB
const insertData = async () => {
  try {
    await Member.create(members);

    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
}
