const API_KEY = `60c1112f70bc2b02e9583cf8115e9f1260362b37bf5bd0649c11f595e81ac283`;
let booksList = [];
let numFound = 0;
let pageSize = 10;
let pageNo = 1;
const groupSize = 5;
const goHome = document.getElementById("go-home");

const params = new URLSearchParams(window.location.search);
const keyWord = params.get("keyword") || "수학"; // 기본값 설정

if (keyWord) {
  document.getElementById(
    "resultText"
  ).textContent = `검색 결과: ${decodeURIComponent(keyWord)}`;
} else {
  document.getElementById("resultText").textContent = "검색어가 없습니다.";
}

const getSearchResult = async () => {
  const url = new URL(
    `http://data4library.kr/api/srchBooks?authKey=${API_KEY}&title=${keyWord}&exactMatch=true&format=json`
  );
  console.log("uuu", url);
  url.searchParams.set("pageSize", pageSize);
  url.searchParams.set("pageNo", pageNo);

  const response = await fetch(url);

  const data = await response.json();

  booksList = data.response?.docs?.map((item) => item.doc) || [];
  numFound = data.response?.numFound;
  console.log("totalBooks", numFound);
  console.log("rrr", response);
  console.log("ddd", data);

  console.log("booksList의 원시 데이터:", booksList);
  console.log("booksList의 타입:", typeof booksList);
  console.log("booksList 배열 여부:", Array.isArray(booksList));
  console.log("booksList의 키들:", Object.keys(booksList));

  render();

  paginationRender();
};

const render = () => {
  if (!Array.isArray(booksList) || booksList.length === 0) {
    console.error("booksList가 비었거나 배열이 아님:", booksList);
    document.getElementById(
      "books-board"
    ).innerHTML = `<div class="alert alert-danger" role="alert">
  검색 결과가 없습니다.
</div>`;

    return;
  }

  const booksHTML = booksList
    .map((books) => {
      return `<div class="row books libs">
          <div class="col-lg-2">
          <div class="image-section">
            <img class="img-thumbnail rounded img-fluid book-image-size"
              src=${
                books.bookImageURL
                  ? books.bookImageURL
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU"
              }"
              onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU';"
            />
            </div>
            <div class="book-detail">
            <button type="button" class="btn btn-outline-info btn-size" data-isbn="${
              books.isbn13
            }">자세히 보기</button>
            </div>
          </div>
          <div class="col-lg-10 info"">
          <dl class = "to-button-distance">
          <div id = "lib-name">
          <dt class="col-lg-1">
          <i class="fa-solid fa-book"></i>
          </dt>
            <dd class="col-lg-10">${books.bookname || "제목 없음"}</dd>
          </div>
          <div>
          <dt class="col-lg-1">
          <i class="fa-solid fa-feather"> 저자 </i>
          </dt>
            <dd class="col-lg-10">${books.authors || "저자 미상"}</dd>
          </div>
          <div>
          <dt class="col-lg-1">
          <i class="fa-solid fa-upload">  출판사 </i>
          </dt>
            <dd class="col-lg-10"> ${books.publisher || "출판사 미상"}</dd>
          </div>
          <div>
          <dt class="col-lg-1">
          <i class="fa-solid fa-calendar-days"> 출판연도</i>
          </dt>
            <dd class="col-lg-10">${
              books.publication_year || "출판 연도 없음"
            }</dd>
          </div>
            </dl>
            
          </div>
        </div>`;
    })
    .join("");
  console.log("booksList의 타입확인", typeof booksList);
  console.log("booksList 배열여부", Array.isArray(booksList));
  console.log("booksHTML", booksHTML);

  document.getElementById("books-board").innerHTML = booksHTML;

  document.querySelectorAll(".book-detail").forEach((button) => {
    button.addEventListener("click", (event) => {
      const isbn = event.target.dataset.isbn;
      console.log("ISBN번호:", isbn);
      if (isbn) {
        window.location.href = `/detailPage/?isbn=${isbn}`;
      }
    });
  });
};

goHome.addEventListener("click", () => {
  window.location.href = `/`;
});

const paginationRender = () => {
  let paginationHTML = "";
  const totalPages = Math.ceil(numFound / pageSize);
  let pageGroup = Math.ceil(pageNo / groupSize);
  let lastPage = pageGroup * groupSize;
  if (lastPage > totalPages) {
    lastPage = totalPages;
  }

  let last = pageGroup * 5;
  if (last > totalPages) {
    // 마지막 그룹이 5개 이하이면
    last = totalPages;
  }
  let firstPage = lastPage - 4 <= 0 ? 1 : lastPage - 4;
  if (pageNo > 1) {
    paginationHTML = `<li class="page-item" onclick="moveToPage(1)"><a class="page-link" href="#"> &lt;&lt; </a></li>
        <li class="page-item" onclick="moveToPage(${
          pageNo - 1
        })"><a class="page-link" href="#">&lt;</a></li>`;
  }
  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `<li class="page-item ${
      i === pageNo ? "active" : ""
    }" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`;
  }
  if (pageNo < totalPages) {
    paginationHTML += `<li class="page-item" onclick="moveToPage(${
      pageNo + 1
    })"><a class="page-link" href="#"> &gt; </a></li>
      <li class="page-item" onclick="moveToPage(${totalPages})"><a class="page-link" href="#"> &gt;&gt; </a></li>`;
  }

  document.querySelector(".pagination").innerHTML = paginationHTML;
};

const moveToPage = (pageNum) => {
  console.log("movetopage", pageNum);
  pageNo = pageNum;
  getSearchResult();
};

getSearchResult();
