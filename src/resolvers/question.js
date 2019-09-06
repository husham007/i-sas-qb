import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isQuestionOwner, isAdmin, isTest } from './authorization';
import mongoose, { model } from 'mongoose';


const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

  export default {
      Query: {
          questions: async (parent, {cursor, limit = 10}, {models}) => {
            
              const cursorOptions = cursor ? {
                  createdAt: {
                      $lt: fromCursorHash(cursor),
                  },
              }
              : {};
              let page = await models.Question.find(cursorOptions, null, {
                  sort: { createdAt: -1},
                  limit: limit + 1,
              });

              const hasNextPage = page.length > limit;
              const questions = hasNextPage ? page.slice(0,-1): page;
             
              return {
                  page: questions, 
                  pageInfo: {
                      hasNextPage,
                      endCursor: hasNextPage ? toCursorHash(questions[questions.length - 1].createdAt.toString(),
                      ): null,
                  },
              };
          },

          allQuestions: async (parent, args, {models})=>{
            return await models.Question.find();
        },
          question: async (parent, {id}, {models})=>{
              return await models.Question.findById(id);
          },
          searchQuestion: async (parent, {searchInput}, {models})=>{
             // console.log(searchInput.statement);
            let {statement, type, category, level, book} = searchInput;
             //{ name: { $regex: /acme.*corp/, $options: "si" } }}
             let regEx = new RegExp(statement);           
            let searchObj = {};

            if (statement) searchObj.statement = { $regex: regEx, $options: "i" };
            if (type) searchObj.type = type;
            if (category) searchObj.category = category;
            if (level) searchObj.level = level;
            if (book) searchObj.book = book;
            

            // let regex = `/${searchInput.statement}/`;
            
             let questions = models.Question.find(searchObj)
                 

            return questions;
        },
        getStatistics: async (parent, {name}, {models})=>{
          let result = [];
          let book =  await models.QuestionBook.findOne({book: name});

          book.types.forEach(async type => {
            let questions = await models.Question.find({type});
            result.push({key: type, value: questions.length})
          });

          book.levels.forEach(async level => {
            let questions = await models.Question.find({level});
            result.push({key: level, value: questions.length})
          });

          book.categories.forEach(async category => {
            let questions = await models.Question.find({category});
            result.push({key: category, value: questions.length})
          });

          let questions = await models.Question.find({book: name});
          result.push({key: name, value: questions.length})

          return result
      },

        autoCheckAnswer: combineResolvers (
          isTest, async (parent, {questionId, answer}, {me, models}) => {
            const question = await models.Question.findById(questionId);
            if(question.answer === answer){
              return true;
            }
            else {
              return false;
            }
          } 
      ),

      },
      /*
      Question: {
          author: async (question, args, {models})=>{
              return await models.User.findById(question.author)
          }
      }
      */
      Question: {
        async __resolveReference(parent, { me, models }) {  
           // console.log("Question", models)       
            return await models.Question.findById(new mongoose.Types.ObjectId(parent.id))
          },
        author(question) {
          return { __typename: "User", id: question.author };
        },
      },

      Questions: {
      
          questions: async  (parent, args, {me, models})=>{
            console.log("parent",parent);
            return await parent.ids.map(question => {
              console.log(question)
               return models.Question.findById(new mongoose.Types.ObjectId(question));                  
            });
            
          }
        
      },
      

      Mutation: {
          createQuestion: combineResolvers (
              isAuthenticated, async (parent, {statement, category, type, level, answer, options, book}, {me, models}) => {
                  const question = await models.Question.create({
                      statement, category, type, level, answer, options, book, 
                      author: me ? me.id : null ,
                  });
                  return question;
              } 
          ),

          

          editQuestion: combineResolvers(isQuestionOwner, isAuthenticated, async (parent, {id, statement, category, type, level, answer, options, book}, {me, models}) => {

            const q = await models.Question.findById(id);

            if (!q){
                return false;
              }
              else {
                q.statement = statement;
                q.category = category;
                q.type = type;
                q.level = level;
                q.answer = answer;
                q.options = options;
                q.book = book;
                await q.save();
                return q;
              }              
                
            } ) 
        ,

          deleteQuestion: combineResolvers (isAuthenticated, isQuestionOwner, async (parent, {id}, {models})=>{
              const question = await models.Question.findById(id);

              if (!question){
                return false;
              }
              else {
                  await question.remove();
                  return true;
              }
          }),
      }
  }