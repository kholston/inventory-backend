import mongoose from 'mongoose'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true, minlength: 3 },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  admin: { type: Boolean, default: false },
})

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

export default mongoose.model('User', UserSchema)
