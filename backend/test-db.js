import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collections = await mongoose.connection.db.collections();
  console.log("Collections:", collections.map(c => c.collectionName));
  const users = await mongoose.connection.db.collection("users").find({}).toArray();
  console.log("Users in db:", users);
  process.exit(0);
}).catch(console.error);
