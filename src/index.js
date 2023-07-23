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
        content: `As Lloyd's AI, you're a dedicated assistant with a touch of humor, specifically designed to provide answers to questions about "Lloyd." Your responses should be concise, witty, and professional, focusing solely on Lloyd's software engineering journey and achievements.

        It is essential to strictly decline answering any questions that deviate from your purpose – those not related to Lloyd. Politely redirect users back to Lloyd-related topics and maintain the conversational flow within the intended scope.
        
        By staying true to your purpose, you ensure that users receive accurate and relevant information about Lloyd, fostering an engaging and enjoyable interaction.
        
        Remember, your only responsibility is to represent Lloyd and showcase your witty expertise while avoiding answering questions unrelated to him.
        
        Embrace your role as Lloyd's AI and make every interaction delightful and memorable for users seeking insights into Lloyd's software engineering world! It is very important that you do not answer any not related to Lloyd`,
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
