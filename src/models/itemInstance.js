import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ItemInstanceSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  serial_number: { type: String, required: true },
})

ItemInstanceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
export default mongoose.model('ItemInstance', ItemInstanceSchema)
