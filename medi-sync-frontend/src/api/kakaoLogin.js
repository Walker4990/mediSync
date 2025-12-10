import axios from "axios";

const kakaoApiKey = "995feac82707da5c2f69f2b81614024d";
const kakaoSecret = "aD9BoEjOCtx1p5hVGXTkTQTNIXXjQfTk";
const redirectLoginUri = "http://localhost:3000/authLoginKakao";

// 토큰 발급 후 유저 이메일 추출
export const getKakaoToken = async (code) => {
  const res = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    {
      grant_type: "authorization_code",
      client_id: kakaoApiKey,
      redirectUri: redirectLoginUri,
      code: code,
      client_secret: kakaoSecret,
    },
    {
      headers: {
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );

  // 토큰 발급
  const token = res.data.access_token;

  const userData = await axios.get(`https://kapi.kakao.com/v2/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  console.log(userData.data);

  return await axios.post(`http://localhost:8080/api/users/kakao/callback`, {
    loginId: userData.data.id,
    name: userData.data.kakao_account.profile.nickname,
  });
};
