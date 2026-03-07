import mongoose from 'mongoose';

const uri = "mongodb+srv://vibespaceUser:Vibespaceuser0118@vibespace.qr1aoyy.mongodb.net/?appName=VibeSpace";

async function run() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully!");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    process.exit();
  }
}

run();
