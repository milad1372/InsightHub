const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://milad1372:gHeY3WxOHuYDOBMe@cluster-dha.wyksskb.mongodb.net/?retryWrites=true&w=majority', {
  //mongodb+srv://admin:qc1ygdLJEdGItArm@cluster0.chi71iy.mongodb.net/?retryWrites=true&w=majority  
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

module.exports = mongoose.connection;
