require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.chatBot_API,
});
const openai = new OpenAIApi(configuration);

// Variables for rate limiting
const MAX_REQUESTS_PER_MINUTE = 60; // Adjust as per OpenAI API rate limits
let requestCount = 0;
let lastRequestTimestamp = Date.now();

module.exports = {
  chatBot: async (req, res, next) => {
    try {
      const { message } = req.body;

      // Rate limiting: Check if the rate limit has been reached
      const currentTimestamp = Date.now();
      const timeElapsed = currentTimestamp - lastRequestTimestamp;
      if (timeElapsed < 60000 && requestCount >= MAX_REQUESTS_PER_MINUTE) {
        const delay = 60000 - timeElapsed; // Delay in milliseconds
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (timeElapsed >= 60000) {
        // Reset the request count if 1 minute has passed
        requestCount = 0;
      }

      // Make the API call
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${message}`,
        max_tokens: 100,
        temperature: 0.5,
      });

      // Update rate limiting variables
      requestCount++;
      lastRequestTimestamp = Date.now();

      // Return the chatbot response to the frontend
      res.json({ message: response.choices[0].text });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
