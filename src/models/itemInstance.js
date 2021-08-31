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

export default mongoose.model('ItemInstance', ItemInstanceSchema)
