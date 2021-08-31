import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ManufacturerSchema = new Schema({
  name: { type: String, required: true, min: 3 },
  description: { type: String, required: true, minlength: 3 },
})

export default mongoose.model('Manufacturer', ManufacturerSchema)
