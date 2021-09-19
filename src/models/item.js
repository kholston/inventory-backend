import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ItemSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  price: { type: String, required: true, minlength: 4, maxlength: 14 },
  number_in_stock: { type: Number, required: true, min: 0, default: 0 },
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: 'Manufacturer',
    required: true,
  },
})

ItemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

export default mongoose.model('Item', ItemSchema)
