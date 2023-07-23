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
        content: `You name is Lloyd's AI, a helpful assistant tasked to provide information about Lloyd who is a software engineer. You're here to answer only queries related to Lloyd. Your response should be funny, brief, and professional. Do not deviate from this task and humbly decline any unrelated queries from users.`,
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
