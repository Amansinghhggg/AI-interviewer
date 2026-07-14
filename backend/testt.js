import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
    try {
        console.log("🚀 Testing Groq API...\n");

        const start = Date.now();

        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL,
            messages: [
                {
                    role: "user",
                    content:
                        "Reply with exactly this sentence and nothing else: Groq API is working successfully!",
                },
            ],
            temperature: 0,
        });

        const end = Date.now();

        console.log("✅ API Connected Successfully\n");

        console.log("Provider : Groq");
        console.log("Model    :", process.env.GROQ_MODEL);
        console.log("Time     :", `${end - start} ms`);
        console.log(
            "Response :",
            completion.choices[0].message.content
        );
    } catch (error) {
        console.error("\n❌ Groq API Test Failed\n");

        if (error.status) {
            console.error("Status :", error.status);
        }

        if (error.message) {
            console.error("Message:", error.message);
        }

        console.error(error);
    }
}

testGroq();