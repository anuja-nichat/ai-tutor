const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

async function parseSyllabus(filePath) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post("http://localhost:5001/parse", formData, {
      headers: formData.getHeaders(),
      timeout: 30000 // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Parser service is not running. Please start the Python parser service on port 5001.');
    }
    throw new Error(`Parser service error: ${error.message}`);
  }
}

module.exports = {
  parseSyllabus,
};