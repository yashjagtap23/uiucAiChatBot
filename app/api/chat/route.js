import { NextResponse } from "next/server"
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are UIUC's helpful information assistant.
    The average GPA for CS440 is 3.01. Keep your responses under 100 maxOutputTokens or under 7 lines.
    Your primary goal is to provide efficient and friendly support to students and prospective students,
    guiding them through their UIUC experience. Use emojis sparringly and only when appropriate for the current coversation.
    UIUC Overview:
    Mission: To provide students with a comprehensive education and prepare them for successful careers in their chosen fields.
    Programs: Offers a wide range of undergraduate, graduate, and professional programs across various disciplines.
    Support: Provides academic advising, career services, and student support resources.
    Customer Support Focus: Grading System: Clearly explain the UIUC grading scale, GPA calculation, and academic standing policies.
    Class Information: Provide information about class schedules, registration, prerequisites, and course descriptions.
    Academic Policies: Guide students through UIUC's academic policies, including add/drop deadlines, withdrawal procedures, and academic integrity guidelines.
    Support Services: Assist with information about academic advising, tutoring, and other student support services.
    General Inquiries: Provide information about UIUC's mission, values, campus resources, and student life.`
})

async function startChat(history) {
    return model.startChat({
        history: history,
        generationConfig: { 
            maxOutputTokens: 200,
            //responseMimeType: "application/json"
        },
    })
}

export async function POST(req) {
    const history = await req.json()
    const userMsg = history[history.length - 1]

    // history.forEach((element) => {
    //     console.log([element["role"], element["content"]])
    //     console.log(element)
    // });

    // console.log(userMsg.parts[0].text)
    // console.log(typeof(userMsg.parts[0].text))
    try {
        //const userMsg = await req.json()
        const chat = await startChat(history)
        const result = await chat.sendMessage(userMsg.parts[0].text)
        const response = await result.response
        const output = response.text()
    
        return NextResponse.json(output)
    } catch (e) {
        console.error(e)
        return NextResponse.json({text: "error, check console"})
    }
    
    //const result = await chat.sendMessageStream(userMsg); // stream allows returning before entire result is written for faster interaction

    // let text = '';
    // for await (const chunk of result.stream) {
    //     const chunkText = chunk.text();
    //     //console.log(chunkText);
    //     text += chunkText;
    // }
    

}

// export async function continueConversation(history) {
//     const stream = createStreamableValue();
//     const model = google('models/gemini-1.5-flash-latest');

//     (async () => {
//         const { textStream } = await streamText({
//             model: model,
//             messages: history,
//         });

//         for await (const text of textStream) {
//             stream.update(text);
//         }
    
//         stream.done();
//     })().then(() => {});

//     return {
//         messages: history,
//         newMessage: stream.value,
//     };
// }