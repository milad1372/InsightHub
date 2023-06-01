const { Schema } = require('mongoose');

const artworkSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  // saved artwork id from Europeana
  artworkId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = artworkSchema;
