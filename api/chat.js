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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Vercel chưa có GEMINI_API_KEY"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          `Gemini API lỗi ${response.status}`
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini không trả về nội dung.";

    return res.status(200).json({
      reply
    });

  } catch (error) {
    return res.status(500).json({
      error: error?.message || String(error)
    });
  }
}
