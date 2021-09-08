import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ManufacturerSchema = new Schema({
  name: { type: String, required: true, minLength: 3 },
  description: { type: String, required: true, minLength: 3 },
})

ManufacturerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

export default mongoose.model('Manufacturer', ManufacturerSchema)
