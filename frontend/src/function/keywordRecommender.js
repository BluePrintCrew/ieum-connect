import axios from 'axios';

let isUpdatingKeywords = false;

export const recommendKeywords = async (prompt) => {
  if (isUpdatingKeywords) return [];
  isUpdatingKeywords = true;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const chatGPTKeywords = response.data.choices[0].message.content
      .split(',')
      .map((kw) => kw.trim().replace(/^#+/, ''))
      .filter((kw) => kw !== '' && kw !== '"');

    return chatGPTKeywords;
  } catch (error) {
    console.error('키워드 추천 중 오류 발생:', error);
    return [];
  } finally {
    isUpdatingKeywords = false;
  }
};

export const recommendKeywordsFromLabel = async (label) => {
  return await recommendKeywords(
    `사용자가 이미지에서 '${label}' 객체를 감지하였습니다. 해당 객체와 관련된 한국어 해시태그 키워드 3개를 추천해 주세요.`
  );
};

export const recommendKeywordsFromChatGPT = async () => {
  return await recommendKeywords(
    "이미지에서 탐지된 객체가 없으므로, 이 이미지는 풍경 사진일 가능성이 높습니다. 풍경 사진과 관련된 한국어 해시태그 키워드 3개를 추천해 주세요. 예를 들어, '자연', '여행', '풍경'과 같은 키워드를 추천해 주세요."
  );
};
