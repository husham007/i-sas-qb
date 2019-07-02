import mongoose from 'mongoose';
import Question from './question';
import QuestionBook from './questionBook';


const connectDb = () => {
  if (process.env.TEST_DATABASE_URL) {
    console.log(process.env.TEST_DATABASE_URL);
    return mongoose.connect(
      process.env.TEST_DATABASE_URL,
      { useNewUrlParser: true },
    );
  }

  if (process.env.DATABASE_URL) {
    
    
    return mongoose.connect(
      process.env.DATABASE_URL,
      { useNewUrlParser: true },
    );
  }
};





  export { connectDb };
  const models = {Question, QuestionBook};

  export default models;