import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isQuestionOwner, isAdmin } from './authorization';

export default {
    Query: {
        questionBooks: async (parent, param, {models}) => {
            return await models.QuestionBook.find();
        }, 
        questionBookByName: async (parent, {name}, {models}) => {
            return await models.QuestionBook.findOne({book: name});
        }, 
       
    }
}