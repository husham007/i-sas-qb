import questionResolvers from './question';
import questionBookResolvers from './questionBook'
import { merge } from 'lodash';

const resolvers = {};
export default merge(resolvers, questionResolvers, questionBookResolvers);

