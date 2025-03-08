//1. 검색결과페이지에서 도서검색api에 있는 isbn을 도서 소장 도서관api에 받아온다
// 도서관 범위를 region으로 정해줘야 하는데.. 사용자의 위치를 받거나 해야 할 듯?
//2. 해당 도서를 보유한 리스트가 페이지에 나온다.
//3. 리스트에 있는 도서관의 위치를 kakakoMap에 보내준다.

const API_KEY =
  "b14cca520846c95ce8b27fd7604c9de537395aba801650123783e2478da5a64c";

const params = new URLSearchParams(window.location.search); //현재 URL의 쿼리 문자열을 분석하여 객체를 생성
const isbn = params.get("isbn"); //쿼리 파라미터에서 isbn 값을 가져온다.

if (isbn) {
  //isbn값이 존재하면
  let url = new URL( //도서 소장 도서관api
    `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=11&isbn=${decodeURIComponent(
      isbn
    )}&format=json`
  );
}

let url1 = new URL( //도서검색api
  `http://data4library.kr/api/srchBooks?authKey=${API_KEY}&keyword=어린왕자&pageNo=1&pageSize=10&format=json`
);

let url2 = new URL( //도서 소장 도서관api
  `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=11&isbn=9788995772423&format=json`
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
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      if (
        !data.response ||
        !data.response.libs ||
        data.response.libs.length === 0
      ) {
        throw new Error("도서를 소장한 도서관이 없습니다.");
      }
      libList = data.response.libs;
      console.log("libList", libList);

      //   data.response.libs.forEach((item) => {
      //     console.log("libList", item.lib);
      //   });
      libsRender();
    } else {
      console.log("response.status", response.status);
      throw new Error(data.message);
    }
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
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
  console.log("html :", libListHTML);
  document.getElementById("libs-board").innerHTML = libListHTML;
}

const errorRender = (errorMessage) => {
  const errorHTML = `<div class="col-lg-8" id="lib-name">
  <i class="fa-solid fa-book"></i>${errorMessage}</div>
  </div>`;
  document.getElementById("libs-board").innerHTML = errorHTML;
};

function copyAddress(event) {
  //주소를 복사하는 함수
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

//--------------------

// var geocoder = new kakao.maps.services.Geocoder();

// var callback = function (result, status) {
//   if (status === kakao.maps.services.Status.OK) {
//     console.log("지역 명칭 : " + result[0].address_name);
//     console.log("행정구역 코드 : " + result[0].code);
//   }
// };

// geocoder.coord2RegionCode(126.9786567, 37.566826, callback);
