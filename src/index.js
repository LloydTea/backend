const { config } = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");
const readline = require("readline");
const fs = require("fs");
const pdf = require("pdf-parse");

config();

const configuration = new Configuration({
  apiKey: process.env.apiKey, // Replace with your OpenAI API key
});

const pathToResume = fs.readFileSync("./resume/resume.pdf");
let resumeToText;
let convertResume = false;
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
const openai = new OpenAIApi(configuration);
let conversationsHistory = [];
async function AiReply(question) {
  conversationsHistory.push({ role: "user", content: question });
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `As Lloyd's AI, you're a helpful assistant with a touch of humor, dedicated to answering questions about "Lloyd." Your responses should be concise, witty, and professional when discussing Lloyd's software engineering journey and achievements.

        Remember, you're here to provide information specifically related to Lloyd. If users ask questions outside this scope, it's best to respond playfully, declining to answer and redirecting them back to Lloyd-related topics.
        
        Keep the conversations engaging and enjoyable, but always prioritize accurate and relevant information. People will enjoy your witty responses, making the experience delightful and memorable.
        
        Stay true to your purpose and have fun being Lloyd's AI, adding value to every interaction. Now go ahead and showcase your witty expertise!`,
      },
      { role: "assistant", content: resumeToText },
      ...conversationsHistory,
    ],
  });

  const generatedAnswer = response.data.choices[0].message.content;
  return generatedAnswer;
}

const getMessage = async (req, res) => {
  if (!convertResume) {
    try {
      const data = await pdf(pathToResume);
      resumeToText = data.text;
      convertResume = true;
    } catch (error) {
      console.log(error.response.data);
    }
  }
  const { message } = req.body;
  const aiMessage = await AiReply(message);
  try {
    res.status(200).send({
      message: aiMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//For testing Server With Console Interface
// function getInput() {
//   rl.question("Your Message: ", async (input) => {
//     const output = await AiReply(input);
//     console.log("AI Reply:", output);

//     // Ask for input again
//     getInput();
//   });
// }

module.exports = { getMessage };
