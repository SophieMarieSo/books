const KEY = '0be2c234076cb8fbd8415ff20f098c4d8056523a3bba5af8ccb7f29cddee5a79';
const params = new URLSearchParams(window.location.search);
const isbn = params.get('isbn') || params.get('isbn13');

if (!isbn) {
  alert('ISBN 값이 올바르지 않습니다.');
}

const urlSrchDtlList = new URL(
  `http://data4library.kr/api/srchDtlList?authKey=${KEY}&isbn13=${isbn}&format=json&loaninfoYN=Y`
);
const urlHotTrend = new URL(
  `http://data4library.kr/api/hotTrend?format=json&authKey=${KEY}`
);
const bookBasicInfo = document.querySelector('.bookBasicInfo');
const bookDescription = document.getElementById('bookDesc');
const hotBook = document.querySelector('.d-flex.overflow-auto.gap-3.p-2');
const tabs = document.querySelectorAll('.categoryTabs');
const underline = document.getElementById('under-line');
const list1 = document.getElementById('list1');
const category = document.getElementById('.categoryList');

// 카테고리 클릭 시 해당 카테고리 위치로 이동
document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.categoryTabs div'); // 탭 요소들

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function () {
      // 모든 탭에서 'active' 클래스 제거 후 현재 클릭한 탭에 추가
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // 해당하는 섹션으로 스크롤 이동
      const sectionId = `#section${index + 1}`;
      const targetSection = document.querySelector(sectionId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// 책 정보 가져오기
const getBooks = async () => {
  try {
    // API 호출
    const response = await fetch(urlSrchDtlList);
    const data = await response.json();
    console.log(data);

    // 책 데이터 추출
    const bookData = data.response?.detail?.[0]?.book || {};

    // 책 기본 정보 표시
    bookBasicInfo.innerHTML = `
  <div class="row">
    <div class="col-lg-3 col-sm-12">
      <div><img class="img-fluid" id="bookImg" src="${
        bookData.bookImageURL && bookData.bookImageURL !== null
          ? bookData.bookImageURL
          : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'
      }" 
      onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';" 
      alt="Book Image" /></div>
    </div>
    
    <div class="col-lg-9 co-sm-12">
      <div class="bookBasicInfo-detail">
        <div id="bookclass">${bookData.class_nm}</div>
        <div><h1 id="bookName">${bookData.bookname}</h1></div>
        <div id="bookAuthor">${bookData.authors} 저</div>
        <div id="bookPublisher">${bookData.publisher} 출판</div>
        <div id="section1" class="content-section">
        <div class="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            class="btn btn-primary"
            id="kyobo"
          >
            교보문고
          </button>
          <button
            type="button"
            class="btn btn-primary"
            id="aladin"
          >
            알라딘
          </button>
          <button
            type="button"
            class="btn btn-primary"
            id="library"
          >
            도서관
          </button>
        </div>
      </div>
      </div>
    </div>
  </div>
`;
    const kyoboBtn = document.getElementById('kyobo');
    const aladinBtn = document.getElementById('aladin');
    const libraryBtn = document.getElementById('library');

    // 교보문고로 이동
    kyoboBtn.addEventListener('click', () => {
      window.open(
        encodeURI(
          `https://search.kyobobook.co.kr/search?keyword=${bookData.bookname}&gbCode=TOT&target=total`
        ),
        '_blank'
      );
    });

    // 알라딘으로 이동
    aladinBtn.addEventListener('click', () => {
      window.open(
        `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${bookData.bookname}`,
        '_blank'
      );
    });

    //  도서관 페이지로 이동
    libraryBtn.addEventListener('click', () => {
      window.location.href = `/libraryPage/?isbn13=${isbn}`;
    });

    // 책 설명 표시
    bookDescription.innerHTML =
      bookData.description && bookData.description.trim() !== ''
        ? bookData.description
        : '해당 내용이 없습니다.';

    // 급상승 도서 목록 가져오기
    getHotBook();
  } catch (error) {
    console.error('책 정보를 가져오는 중 오류 발생:', error);
  }
};

// 급상승 도서 가져오기
const getHotBook = async () => {
  try {
    const getFormattedDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    // 날짜 파라미터 설정
    urlHotTrend.searchParams.set('searchDt', getFormattedDate()); //날짜  getFormattedDate()으로 수정하기

    // API 호출
    const response = await fetch(urlHotTrend);
    const data = await response.json();
    console.log(data);

    // 대출 급상승 도서 리스트 추출
    const results = data.response?.results || [];
    const latestResult = results.find((item) => item.result.docs.length > 0);

    if (!latestResult) {
      console.warn('급상승 도서 데이터를 찾을 수 없습니다.');
      return;
    }

    const bookDataList = latestResult.result.docs;

    // 급상승 도서 목록 표시
    hotBook.innerHTML = bookDataList
      .map(
        (item) => ` 
<div class="book">
  <img src="${item.doc.bookImageURL}" class="img-fluid" alt="${item.doc.bookname}" 
    style="height: 250px ;cursor: pointer;" onclick="getAnotherHotBook('${item.doc.isbn13}')"
 />

</div>
`
      )
      .join('');
  } catch (error) {
    console.error('급상승 도서 정보를 가져오는 중 오류 발생:', error);
  }
};

const getAnotherHotBook = (isbn) => {
  console.log('Clicked ISBN:', isbn);
  if (!isbn) {
    alert('ISBN 값이 올바르지 않습니다.');
    return;
  }
  window.open(`/detailPage/?isbn=${isbn}`, '_blank');
};

// 슬라이드 이동
let currentIndex = 0;

const moveSlide = (direction) => {
  const slider = document.querySelector('.slider');
  const books = document.querySelectorAll('.book');
  const totalBooks = books.length;

  // 인덱스 갱신
  currentIndex += direction;

  // 인덱스가 범위를 벗어나면 처음 또는 끝으로 이동
  if (currentIndex < 0) {
    currentIndex = totalBooks - 1; // 처음으로 돌아가기
  } else if (currentIndex >= totalBooks) {
    currentIndex = 0; // 끝으로 돌아가기
  }

  // 슬라이드 오프셋 계산
  const offset = -currentIndex * (books[0].offsetWidth + 10); // 책 너비와 간격을 고려한 오프셋 계산
  slider.style.transform = `translateX(${offset}px)`;
};

// 초기화: 책 정보 가져오기
getBooks();

// navbar search section
const searchArea = document.getElementById('search-area');
const recordButton = document.getElementById('record-button');
const searchForm = document.getElementById('search-form');

let recognition;
function availabilityFunc() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('현재 브라우저는 음성 인식을 지원하지 않습니다.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ko';
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  recognition.interimResults = false;
}

function startRecord() {
  if (!recognition) {
    return;
  }

  recordButton.disabled = true;
  searchArea.value = '';
  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchArea.value = transcript;
  };

  recognition.onerror = (event) => {
    recordButton.disabled = false;
    alert('음성 인식에 실패했습니다. 다시 시도해주세요.');
    console.error('음성 인식 오류:', event.error);
  };

  recognition.onend = () => {
    recordButton.disabled = false;
  };

  recognition.start();
}

window.addEventListener('load', availabilityFunc);

const onSubmit = (event) => {
  event.preventDefault();
  const searchValue = searchArea.value.trim();

  if (searchValue) {
    window.location.href = `/resultPage/?keyword=${encodeURIComponent(
      searchValue
    )}`;
  }

  searchArea.value = '';
};

searchForm?.addEventListener('submit', onSubmit);
