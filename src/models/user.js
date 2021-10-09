import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { async } from 'regenerator-runtime'

const saltRounds = 10

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

UserSchema.pre('save', async function (next) {
  const user = this
  const hash = await bcrypt.hash(user.passwordHash, saltRounds)

  user.passwordHash = hash
  next()
})

UserSchema.methods.isValidPassword = async function (password) {
  const user = this
  const compare = await bcrypt.compare(password, user.passwordHash)

  return compare
}

export default mongoose.model('User', UserSchema)
