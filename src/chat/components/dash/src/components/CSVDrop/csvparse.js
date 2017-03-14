var csv = require("fast-csv");

function csvparse(file){
	//var csvData;
csv
 .fromPath(file, {headers: true, strictColumnHandling:true})
 .on("error", function(data){
   return 'Error parsing csv';                         
 })
 .on("data", function(data){
     //csvData += data;
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });
 //console.log(csvData);
 return csvData;
}
 export default csvparse;