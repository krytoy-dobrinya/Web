import mongoose from "mongoose"

export const connectDB = () => {
    mongoose
        .connect("mongodb://admin:1234@localhost:27017/web?authSource=admin")
        .then(() => console.log("DB connected!"))
        .catch((err) => console.error(err))
}