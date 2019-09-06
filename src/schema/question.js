import { gql } from 'apollo-server-express';

export default gql `
extend type Query {
    # Fetches Question pages
    # Each page have Questions and pageInfo
    # pageInfo has hasNextPage boolean and cursor for next page
    questions(cursor: String, limit: Int): QuestionPages!
    allQuestions: [Question]
    
    # Fetches a Question Object given its ID.
    question(id: ID!): Question!
    searchQuestion (searchInput: SearchInput!): [Question]
    autoCheckAnswer(questionId: ID!, answer: String!): Boolean!
    getStatistics(book: String!): [statistic]



    questionBooks: [Book]!
    questionBookById(id: ID!): Book!
    questionBookByName(name: String!): Book!
}

extend type Mutation {
    createQuestion(statement: String!, category: String!, type: String!, level: String!, answer: String!, options: [String] book: String!): Question!
    editQuestion(id: ID!, statement: String!, category: String!, type: String!, level: String!, answer: String!, options: [String]! book: String!): Question!
    deleteQuestion(id: ID!): Boolean!
   
    
}

type statistic {
    key: String
    value: String
    statistic: String
}

type QuestionPages {
    page: [Question!]!
    pageInfo: PageInformation! 
}

type PageInformation {
    hasNextPage : Boolean!
    endCursor: String
}

type Question @key (fields: "id"){
    id: ID!
    statement: String!
    category: String!
    type: String!
    level: String!
    answer: String!
    option: [String]
    author: User 
    book: String!
}

type Questions @key (fields: "ids"){
    ids: [ID]
    questions: [Question!]
    
}





type Book @key (fields: "book"){
    book: String!
    categories: [String]!
    types: [String]!
    levels: [String]!
}

input SearchInput {
    statement: String
    category: String
    type: String
    level: String
    answer: String
    option: [String]   
    book: String
}

extend type User @key(fields: "id") {
    id: ID! @external    
  }  
`;