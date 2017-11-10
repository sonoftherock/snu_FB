
var utc = new Date().setUTCHours(28);
var todayDate = new Date(utc).toISOString().slice(0,16);
if (todayDate.slice(0,16) == "2017-11-11T04:45"){
  console.log(todayDate);
} else {
  console.log(todayDate)
}
