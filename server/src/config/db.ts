import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();

const connectDB = async () : Promise<void> => {
    try {
        const connectionURI = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/synchub');
        console.log(`MongoDB Connected: ${connectionURI.connection.host}`);
    } catch (error : unknown) {
        if(error instanceof Error){
            console.error(`Error: ${error.message}`);
        }else{
            console.error(`Unexpected error: ${error}`);
        }
        process.exit(1);
    }
}

export default connectDB;