//1. 검색결과페이지에서 도서검색api에 있는 isbn을 도서 소장 도서관api에 받아온다
// 도서관 범위를 region으로 정해줘야 하는데.. 사용자의 위치를 받거나 해야 할 듯?
//2. 해당 도서를 보유한 리스트가 페이지에 나온다.
//3. 리스트에 있는 도서관의 위치를 kakakoMap에 보내준다.

const API_KEY =
  "b14cca520846c95ce8b27fd7604c9de537395aba801650123783e2478da5a64c";

let url1 = new URL( //도서검색api
  `http://data4library.kr/api/srchBooks?authKey=${API_KEY}&keyword=어린왕자&pageNo=1&pageSize=10&format=json`
);
let url2 = new URL( //도서 소장 도서관api
  `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=11&isbn=9788995772423&format=json`
);

let libList = [];

//api에서 데이터를 받아오는 함수
const getLibList = async () => {
  const response = await fetch(url2);
  const data = await response.json();
  console.log("data", data);

  libList = data.response.libs;
  console.log("libList", libList);

  //   data.response.libs.forEach((item) => {
  //     console.log("libList", item.lib);
  //   });
  libsRender();
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
          <dd class="col-lg-10"><a href="tel:${libs.lib.tel}">${libs.lib.tel}</a></dd>
        </div>
        <div>
          <dt class="col-lg-1">
        <i class="fa-solid fa-location-dot"></i>
        주소</dt>
          <dd class="col-lg-10" id="lib-address" onclick="copyAddress(event)">${libs.lib.address}</dd>
        </div>
        <div>
          <dt class="col-lg-1" id="lib-time">
        <i class="fa-solid fa-clock"></i>
        영업시간</dt>
          <dd class="col-lg-10">${libs.lib.operatingTime}</dd>
        </div>
        <div>
          <dt class="col-lg-1" id="lib-close-day">
        <i class="fa-solid fa-calendar-minus"></i>
        휴관일</dt>
          <dd class="col-lg-10">${libs.lib.closed}</dd>
        </div>
      </dl>
    </div>
  </div>`
  );
  console.log("html :", libListHTML);
  document.getElementById("libs-board").innerHTML = libListHTML;
}

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
