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
  const keyword = searchArea.value.trim();

  if (keyword) {
    window.location.href = `/resultPage/?keyword=${encodeURIComponent(
      keyword
    )}`;
  }

  searchArea.value = '';
};

searchForm.addEventListener('submit', onSubmit);

const API_KEY =
  '2f405728e7e81ae3246b8edd5f2fc7c0d85700687facb3d9bbbfe6175c4853f3';

let booksList = [];

function xmlToJson(xml) {
  let obj = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3 && xml.nodeValue.trim()) {
    obj = xml.nodeValue.trim();
  } else if (xml.nodeType === 4) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i);
      let nodeName = item.nodeName;

      if (!obj[nodeName]) {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (!Array.isArray(obj[nodeName])) {
          obj[nodeName] = [obj[nodeName]];
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }

  return obj;
}

const getXMLfromAPI = async () => {
  try {
    const url = new URL(
      `http://data4library.kr/api/loanItemSrch?authKey=${API_KEY}&startDt=2022-01-01&endDt=2022-03-31&gender=1&age=20&region=11;31&addCode=0&kdc=6&pageNo=1&pageSize=10`
    );
    const response = await fetch(url);
    const data = await response.text();
    const XmlNode = new DOMParser().parseFromString(data, 'text/xml');
    const jsonData = xmlToJson(XmlNode);

    console.log('Converted JSON:', jsonData);

    // booksList 업데이트
    booksList = Array.isArray(jsonData.response.docs.doc)
      ? jsonData.response.docs.doc
      : [jsonData.response.docs.doc];

    render();
  } catch (error) {
    alert('에러 입니다.');
  }
};

const render = () => {
  const books1 = booksList.slice(0, 5); // 0~4 -> 1-5번
  const books2 = booksList.slice(5, 10); // 5~9 -> 6-10번

  const booksHTML = (books) => {
    return books
      .map((book) => {
        const title = book.bookname?.['#cdata-section'] || book.bookname;
        const isbnnum = book.isbn13?.['#cdata-section'] || book.isbn13;
        const imageUrl =
          book.bookImageURL?.['#cdata-section'] || book.bookImageURL;

        console.log(isbnnum);

        return `
      <div class="img-box" onclick="window.location.href = /detailPage/?isbn=${isbnnum}">
        <img src="${imageUrl}" class="img-fluid img-thumbnail alt="${title}">
        <div class="none" >${title}</div>
      </div>
    `;
      })
      .join('');
  };

  document.getElementById('books1').innerHTML = booksHTML(books1);
  document.getElementById('books2').innerHTML = booksHTML(books2);
};

getXMLfromAPI();
