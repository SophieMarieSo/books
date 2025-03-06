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

const getLibList = async () => {
  const response = await fetch(url2);
  const data = await response.json();
  console.log("data", data);

  libList = data.response.libs;
  console.log("libList", libList);

  //   data.response.libs.forEach((item) => {
  //     console.log("libList", item.lib);
  //   });
};
getLibList();

function libsRender() {
  const libListHTML = libList.map();
}
