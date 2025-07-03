
const {GoogleGenerativeAI}=require("@google/generative-ai");

const genAI= new GoogleGenerativeAI(process.env.GEMINI_APIKEY)

const model=genAI.getGenerativeModel({
    model:"gemini-2.0-flash",
    systemInstruction:"You are a expert in code reviewing and you will be given a code and you have to tell about the errors or suggestions in the code in short."
});


async function generateContent(prompt){
    const result=await model.generateContent(prompt)
    return result.response.text();
}
module.exports=generateContent;