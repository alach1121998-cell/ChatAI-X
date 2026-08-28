export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Chỉ hỗ trợ POST"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Bạn chưa nhập tin nhắn"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Vercel chưa có OPENAI_API_KEY"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.error ||
          `OpenAI API lỗi ${response.status}`
      });
    }

    return res.status(200).json({
      reply: data.output_text || "AI không trả về nội dung."
    });

  } catch (error) {
    return res.status(500).json({
      error: error?.message || String(error)
    });
  }
}
