const { Pinecone } = require("@pinecone-database/pinecone");

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = client.Index(process.env.PINECONE_INDEX);

module.exports = index;