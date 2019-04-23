const contentful = require("contentful");
require('dotenv').config();

export default contentful.createClient({
  space: process.env.SPACE_ID,
  accessToken: process.env.CONTENT_DELIVERY_API_TOKEN
});
