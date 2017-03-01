import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

function fromISODate(value) { 
    try {
        if (!value) return null;
        return new Date(value);
    }
    catch(e) {
        return null;
    }
 } 

 function toISODate(d) {
     if (!d) return null;
     if ((d instanceof Date)) {
        return d.toISOString(); 
     }
     return d;
 }

const GraphQLDate = new GraphQLScalarType({ 
   name: 'Date', 
   description: 'A special custom Scalar type for Dates that converts to a ISO formatted string ', 
   serialize: toISODate, 
   parseValue: fromISODate, 
   parseLiteral(ast) { 
       return new Date(ast.value); 
   }
});

export default GraphQLDate