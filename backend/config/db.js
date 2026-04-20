import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://busdb:IqYfwLZ0POb3oXWC@cluster0.q3nvzez.mongodb.net/busDB";
    await mongoose.connect(mongoUri)
    console.log("MongoDB Connected ✅")
  } catch (error) {
    console.log("MongoDB Error ❌", error)
    process.exit(1)
  }
}

export default connectDB