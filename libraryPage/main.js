//현재 위치를 기반으로 가까운 도서관 목록 3~5곳을 띄운는 기능을 추가해야 함.

const API_KEY =
  "b14cca520846c95ce8b27fd7604c9de537395aba801650123783e2478da5a64c";

const params = new URLSearchParams(window.location.search); //현재 URL의 쿼리 문자열을 분석하여 객체를 생성
const isbn = params.get("isbn"); //쿼리 파라미터에서 isbn 값을 가져온다.

if (isbn) {
  //isbn값이 존재하면
  let url = new URL( //도서 소장 도서관api (실제 사용할 코드)
    `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=11&isbn=${decodeURIComponent(
      isbn
    )}&format=json`
  );
}

let url1 = new URL( //도서검색api (테스트용)
  `http://data4library.kr/api/srchBooks?authKey=${API_KEY}&keyword=어린왕자&pageNo=1&pageSize=10&format=json`
);

let url2 = new URL( //도서 소장 도서관api (테스트용)
  `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=21&isbn=9788995772423&format=json`
);

let libList = [];

//api에서 도서관 목록을 받아오는 함수
const getLibList = async () => {
  try {
    const response = await fetch(url2);
    const data = await response.json();
    console.log("data", data);

    if (response.status === 200) {
      console.log("response.status", response.status);
      if (!response.ok) {
        //HTTP 응답 상태 코드가 200이 아닌 경우 오류를 발생시켜 catch블록으로 이동
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      if (
        //유효성 검사, response객체 안에 libs배열이 있는지 확인. 없거나 길이가 0이면 오류를 발생시켜 이동.
        !data.response ||
        !data.response.libs ||
        data.response.libs.length === 0
      ) {
        throw new Error("도서를 소장한 도서관이 없습니다.");
      }
      libList = data.response.libs; //유효한 libs배열을 변수에 할당
      console.log("libList", libList);

      libsRender(); //도서관 목록을 렌더링.
    } else {
      console.log("response.status", response.status);
      throw new Error(`HTTP 오류 발생: ${response.status} - ${data.message}`);
    }
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      //네트워크 오류 발생했을 때
      errorRender("네트워크 오류 발생! 인터넷 연결을 확인해주세요.");
    }
    errorRender(error.message);
  }
};
getLibList();

//도서관 목록을 렌더하는 함수
function libsRender() {
  const libListHTML = libList.map(
    (libs) => `<div class="row libs">
    
    <div class="col-lg-8" id="lib-name">
    <a href="${libs.lib.homepage}">
    <i class="fa-solid fa-book"></i>${libs.lib.libName}</a></div>
    <div class="info">
      <dl>
        <div>
          <dt class="col-lg-1" id="lib-call">
          <i class="fa-solid fa-phone"></i>전화번호</dt>
          <dd class="col-lg-10"><a href="tel:${libs.lib.tel}">${
      libs.lib.tel || "정보 없음"
    }</a></dd>
        </div>
        <div>
          <dt class="col-lg-1">
        <i class="fa-solid fa-location-dot"></i>
        주소</dt>
          <dd class="col-lg-10" id="lib-address" onclick="copyAddress(event)">${
            libs.lib.address || "주소 정보 없음"
          }</dd>
        </div>
        <div>
          <dt class="col-lg-1" id="lib-time">
        <i class="fa-solid fa-clock"></i>
        영업시간</dt>
          <dd class="col-lg-10">${libs.lib.operatingTime || "정보 없음"}</dd>
        </div>
        <div>
          <dt class="col-lg-1" id="lib-close-day">
        <i class="fa-solid fa-calendar-minus"></i>
        휴관일</dt>
          <dd class="col-lg-10">${libs.lib.closed || "정보 없음"}</dd>
        </div>
      </dl>
    </div>
  </div>`
  );
  document.getElementById("libs-board").innerHTML = libListHTML;
}

//에러가 발생했을 때 화면에 에러를 보여줄 함수
const errorRender = (errorMessage) => {
  const errorHTML = `<div class="row libs">
    <div class="col-lg-8" id="lib-error">
      <i class="fa-solid fa-book"></i>${errorMessage}</div>
    </div>
  </div>
  `;
  document.getElementById("libs-board").innerHTML = errorHTML;
};

//주소를 복사하는 함수
function copyAddress(event) {
  const copyText = event.target.innerText;
  navigator.clipboard
    .writeText(copyText)
    .then(() => {
      alert("주소가 클립보드에 복사되었습니다.");
    })
    .catch((err) => {
      console.log("클립보드 복사에 실패했습니다.", err);
    });
}
