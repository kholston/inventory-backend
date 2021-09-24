import 'regenerator-runtime/runtime'
import Category from '../models/category'
import Item from '../models/item'
import ItemInstance from '../models/itemInstance'
import Manufacturer from '../models/manufacturer'
import User from '../models/user'

const intitialCategories = [
  {
    name: 'Guitars',
    description: 'Fretted musical string instruments',
  },
  {
    name: 'Synthesizers',
    description: 'Electronic musical instruments that generate audio signals',
  },
  {
    name: 'Microphones',
    description:
      'Devices - tranducers - that convert sound into electrical signals.',
  },
  {
    name: 'Samplers',
    description:
      'Electronic or digital musical instrument that uses sound recordings to create music.',
  },
]

const initialManufacturers = [
  {
    name: 'Fender',
    description: 'American manufacturer of stringed instruments and amplifiers',
  },
  {
    name: 'Korg',
    description: 'Japanese electronic musical instrument manufacturer',
  },
  {
    name: 'Elektron',
    description: 'Swedish developer and manufacturer of musical instruments',
  },
  {
    name: 'Roland',
    description:
      'Japanese manufacturer of electronic instruments, electronic equipment, and software',
  },
  {
    name: 'Shure',
    description: 'American audio products corporation',
  },
]

const initialItems = [
  {
    name: 'Player Statocaster Electric Guitar',
    description:
      'Fender Player guitar with 2-point tremolo system, a maple neck, and Alnico 5 pickups',
    price: '699.99',
    number_in_stock: 2,
  },
  {
    name: 'American Pro Stratocaster Electric Guitar (with case)',
    description:
      'Fender American Pro guitar with rosewood fingerboard and a trio of mixed-alnico V-Mod single-coil pickups',
    price: '1449.99',
    number_in_stock: 3,
  },
  {
    name: 'KROSS 2 Keyboard Synthesizer Workstation, 61 key',
    description:
      'A cross between a performance synth and a production workstation with 1075 presets and a sequencer',
    price: '799.99',
    number_in_stock: 2,
  },
  {
    name: 'Digitakt',
    description:
      'A drum machine, sampler, and sequencer with 8 audio tracks and 8 midi tracks',
    price: '799.99',
    number_in_stock: 1,
  },
  {
    name: 'GO:KEYS Music Creation Keyboard',
    description:
      'A battery powered synth with 500+ sounds, 600+ looped phrases and performance pads',
    price: '329.99',
    number_in_stock: 2,
  },
  {
    name: 'SP-404A Linear Wave Sampler',
    description:
      'A portable linear wave sampler with built-in mics and mic/line inputs',
    price: '549.99',
    number_in_stock: 1,
  },
]

const initialItemsWithAllFields = (manufacturers, categories) => {
  const itemsWithAllFields = initialItems

  itemsWithAllFields[0].category = [categories[0].id]
  itemsWithAllFields[0].manufacturer = manufacturers[0].id

  itemsWithAllFields[1].category = [categories[0].id]
  itemsWithAllFields[1].manufacturer = manufacturers[0].id

  itemsWithAllFields[2].category = [categories[1].id]
  itemsWithAllFields[2].manufacturer = manufacturers[1].id

  itemsWithAllFields[3].category = [categories[3].id]
  itemsWithAllFields[3].manufacturer = manufacturers[2].id

  itemsWithAllFields[4].category = [categories[1].id]
  itemsWithAllFields[4].manufacturer = manufacturers[3].id

  itemsWithAllFields[5].category = [categories[3].id]
  itemsWithAllFields[5].manufacturer = manufacturers[3].id

  return itemsWithAllFields
}

const initialItemInstances = [
  {
    serial_number: '2516854954',
  },
  {
    serial_number: '6985764351',
  },
  {
    serial_number: '564GD65484',
  },
  {
    serial_number: '658DG66985',
  },
  {
    serial_number: '846ER65496',
  },
  {
    serial_number: 'RTY5795424',
  },
  {
    serial_number: 'WSD5884646',
  },
  {
    serial_number: 'ORTJF-54896',
  },
  {
    serial_number: 'POI456',
  },
  {
    serial_number: 'TDS528',
  },
]
const instancesWithItems = (items) => {
  const completeInstances = initialItemInstances

  completeInstances[0].item = items[0].id
  completeInstances[1].item = items[0].id
  completeInstances[2].item = items[1].id
  completeInstances[3].item = items[1].id
  completeInstances[4].item = items[1].id
  completeInstances[5].item = items[2].id
  completeInstances[6].item = items[2].id
  completeInstances[7].item = items[3].id
  completeInstances[8].item = items[4].id
  completeInstances[9].item = items[4].id

  return completeInstances
}

const manufacturersInDb = async () => {
  const manufacturers = await Manufacturer.find({})
  return manufacturers.map((m) => m.toJSON())
}

const categoriesInDb = async () => {
  const categories = await Category.find({})
  return categories.map((c) => c.toJSON())
}

const itemsInDb = async () => {
  const items = await Item.find({})
    .populate('category', { name: 1, description: 1 })
    .populate('manufacturer', { name: 1, description: 1 })
  return items.map((i) => i.toJSON())
}

const itemInstancesInDb = async () => {
  const itemInstances = await ItemInstance.find({}).populate({
    path: 'item',
    populate: { path: 'manufacturer category' },
  })
  return itemInstances.map((i) => i.toJSON())
}

const nonExistingId = async () => {
  const category = new Category({
    name: 'remove',
    description: 'remove',
  })
  await category.save()
  await category.remove()
  return category._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

export default {
  initialItems,
  initialItemsWithAllFields,
  initialItemInstances,
  instancesWithItems,
  initialManufacturers,
  intitialCategories,
  categoriesInDb,
  itemsInDb,
  itemInstancesInDb,
  manufacturersInDb,
  usersInDb,
  nonExistingId,
}
