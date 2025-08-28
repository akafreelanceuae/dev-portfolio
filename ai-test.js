import OpenAI from "openai";
//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
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say hi to my startup journey!" }],
  });
  console.log(res.choices[0].message.content);
}

main();
