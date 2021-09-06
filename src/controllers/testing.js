import express from 'express'
import Item from '../models/item'
import ItemInstance from '../models/itemInstance'
import Category from '../models/category'
import Manufacturer from '../models/manufacturer'
import User from '../models/user'

const testingRouter = express.Router()

testingRouter.post('/reset', async (request, response) => {
  await Item.deleteMany({})
  await ItemInstance.deleteMany({})
  await Category.deleteMany({})
  await Manufacturer.deleteMany({})
  await User.deleteMany({})

  response.status(204).end
})

export default testingRouter
