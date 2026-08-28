export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Chỉ hỗ trợ POST" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Bạn chưa nhập yêu cầu tạo ảnh"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Vercel chưa có GEMINI_API_KEY"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model: "gemini-3.1-flash-image",
          input: [
            {
              type: "text",
              text: prompt
            }
          ],
          response_format: {
            type: "image",
            aspect_ratio: "9:16",
            image_size: "1K"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `Gemini lỗi ${response.status}`
      });
    }

    const image = data?.output_image;

    if (!image) {
      return res.status(500).json({
        error: "Gemini không trả về ảnh"
      });
    }

    return res.status(200).json({
      image: image
    });

  } catch (error) {
    return res.status(500).json({
      error: error?.message || String(error)
    });
  }
      }
