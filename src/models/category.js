import mongoose from 'mongoose'

const Schema = mongoose.Schema

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 100,
  },
})

export default mongoose.model('Category', CategorySchema)
