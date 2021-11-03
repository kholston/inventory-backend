# Inventory Backend

This is a backend API to manage inventory for any items that need managing.

## Installation

Use the package manager [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install the API dependencies.

npm
```bash
npm install 
```
yarn
```bash
yarn add 
```

The API requires a connection to a MongoDB Database which can be installed locally or set up online as well as an .env file set up to store the variable of the database URL and PORT the application will be running on for security purposes. 

[Local Setup](https://docs.mongodb.com/manual/administration/install-community/) 

[Online Setup](https://docs.atlas.mongodb.com/getting-started/)

[.env Setup](https://www.npmjs.com/package/dotenv)

## Usage

You can access the API directly using [curl](https://curl.se/) 

```bash
curl http://yourHostingURL/api/users

curl http://yourHostingURL/api/categories/4255484

```
or by connecting a frontend of your choice and 
using a HTTP client like [axios](https://axios-http.com/docs/intro)

```javascript
import axios from 'axios'

const baseURL = 'http://yourHostingURL'

const getAllUsers = async () => {
 const response = await axios.get(`${baseUrl}/api/users`)
 return response.data 
}
```

## Deployment
This project uses [Babel compiler](https://babeljs.io/) to allow the use of import statements and other modern javascript features. For production deployment, run the start script in the package.json to compile browser compatible Javascript and start the server. 

npm
```bash
npm start
```

yarn
```bash
yarn start
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
