var csv = require("fast-csv");

function csvparse(file){
csv
 .fromPath(file.name, {headers: true, strictColumnHandling:true})
 .on("error", function(data){
   return false;                         
 })
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });
}
 export default csvparse;