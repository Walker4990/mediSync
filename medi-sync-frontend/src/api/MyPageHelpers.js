// 주민등록번호로 나이와 성별을 계산하는 함수
export const calculateAgeAndGender = (residentNo) => {
  // 13자리 전체가 들어왔을 때만 정확히 계산
  if (residentNo.length !== 13) {
    if (!residentNo || residentNo.length < 7) {
      return { age: "", gender: "" };
    }
  }

  const centuryCode = residentNo.substring(6, 7);
  let yearPrefix = "";
  let genderStr = "";

  // 1, 2: 1900년대 / 3, 4: 2000년대
  if (centuryCode === "1" || centuryCode === "2") {
    yearPrefix = "19";
  } else if (centuryCode === "3" || centuryCode === "4") {
    yearPrefix = "20";
  } else {
    return { age: "", gender: "" }; // 유효하지 않은 코드
  }

  const birthYear = parseInt(yearPrefix + residentNo.substring(0, 2), 10);
  const birthMonth = parseInt(residentNo.substring(2, 4), 10);
  const birthDay = parseInt(residentNo.substring(4, 6), 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    return { age: "", gender: "" };
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  let age = currentYear - birthYear;

  // 생일이 지나지 않았으면 만 나이 계산
  if (
    today.getMonth() + 1 < birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)
  ) {
    age--;
  }

  // 성별 판별: 1, 3: 남 / 2, 4: 여
  if (centuryCode === "1" || centuryCode === "3") {
    genderStr = "M";
  } else if (centuryCode === "2" || centuryCode === "4") {
    genderStr = "F";
  }

  return { age, gender: genderStr };
};
