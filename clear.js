db = connect("mongodb+srv://adminzero:adminzero@cluster0.q07f6y4.mongodb.net/gema_db?retryWrites=true&w=majority")
printjson(db.wisatas.deleteMany)

Promise.all([
  db.wisatas.deleteMany({}),
  db.kriterias.deleteMany({}),
  db.kriteriavalues.deleteMany({}),
]).then(() => {
  printjson('success deleting')
})
.catch(err => {
  printsjson(err);
  printjson('fail to clear data')
})