import 'core-js/stable'
import 'regenerator-runtime/runtime'
import config from './utils/config'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import categoryRouter from './controllers/category'
import manufacturerRouter from './controllers/manufacturer'
import logger from './utils/logger'
import middleware from './utils/middleware'

const app = express()

logger.info('connecting to', config.MONGODB_URI)

// set useFindAndModify to false as mongoose option
mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morgan('tiny'))

app.use('/api/categories', categoryRouter)
app.use('/api/manufacturers', manufacturerRouter)

if (process.env.NODE_ENV === 'test') {
  import('./controllers/testing').then((testingRouter) => {
    app.use('/api/testing', testingRouter.default)
  })
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
