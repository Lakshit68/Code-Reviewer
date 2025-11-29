
const {GoogleGenerativeAI}=require("@google/generative-ai");

const genAI= new GoogleGenerativeAI(process.env.GEMINI_APIKEY)

const model=genAI.getGenerativeModel({
    model:"gemini-2.0-flash",
    systemInstruction:"You are a expert in code reviewing and you will be given a code and you have to first greet the user with thanks for providing the code and then tell about the errors(if any),code explanation(in short) and then suggestions or improvements in the code in short.If a user has not provided Code throw an error."
});


async function generateContent(prompt){
    const result=await model.generateContent(prompt)
    return result.response.text();
}
module.exports=generateContent;
