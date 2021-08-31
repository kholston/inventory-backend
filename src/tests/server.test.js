import supertest from 'supertest'
import app from '../app'

const server = supertest(app)

describe('server starts', () => {
  test.skip('server returns basic message', () => {
    server
      .get('/')
      .expect(200)
      .then((response) => {
        expect(response.text).toContain('Server Running')
      })
  })
})
