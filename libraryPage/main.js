const API_KEY =
  "b14cca520846c95ce8b27fd7604c9de537395aba801650123783e2478da5a64c";
const REST_API_KEY = "0552009c4276d8a33d3336dfc9217b81";

let libList = [];
let currentLatitude = 33.450701;
let currentLongitude = 126.570667;
let regionCode = 39;
let options = {};
let container = document.getElementById("map"); // 카카오 맵 컨테이너
let regionCodeTable = {
  서울: "11",
  부산: "21",
  대구: "22",
  인천: "23",
  광주: "24",
  대전: "25",
  울산: "26",
  세종: "29",
  경기: "31",
  강원: "32",
  충북: "33",
  충남: "34",
  전북: "35",
  전남: "36",
  경북: "37",
  경남: "38",
  제주특별자치도: "39",
};
let positions = [];
let imageSrc =
  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
let libCodeList = [];
let availabilityList = [];
let map;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // ✅ 위치 정보를 가져온 경우
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;

      options = {
        center: new kakao.maps.LatLng(currentLatitude, currentLongitude),
        level: 10,
      };

      // ✅ 지도를 생성
      map = new kakao.maps.Map(container, options);
      reverseGeocoding(currentLatitude, currentLongitude);
    },
    (error) => {
      // ❌ 위치 권한 거부 or 오류 발생 시 기본값 사용
      console.warn(
        "위치 정보를 가져올 수 없음. 기본 좌표로 설정합니다.",
        error
      );

      options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 10,
      };

      // ✅ 기본 좌표로 지도를 생성
      map = new kakao.maps.Map(container, options);
      reverseGeocoding(33.450701, 126.570667);
    }
  );
} else {
  // ❌ geolocation을 지원하지 않는 경우 기본 좌표 사용
  options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 10,
  };

  // ✅ 기본 좌표로 지도를 생성
  map = new kakao.maps.Map(container, options);
  reverseGeocoding(33.450701, 126.570667);
}

const reverseGeocoding = async (Lat, Lng) => {
  let url1 = new URL(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${Lng}&y=${Lat}`
  );
  const response = await fetch(url1, {
    method: "GET",
    headers: {
      Authorization: `KakaoAK ${REST_API_KEY}`,
    },
  });
  const data = await response.json();
  let region = data.documents[0].address.region_1depth_name;
  regionCode = +regionCodeTable[region];
  getLibList();
};

//api에서 도서관 목록을 받아오는 함수
// API에서 도서관 목록을 받아오는 함수
const getLibList = async () => {
  try {
    const params = new URLSearchParams(window.location.search); //현재 URL의 쿼리 문자열을 분석하여 객체를 생성
    const isbn = params.get("isbn"); //쿼리 파라미터에서 isbn 값을 가져온다.

    let url2;

    if (isbn) {
      //isbn값이 존재하면
      url2 = new URL( //도서 소장 도서관api
        `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=${regionCode}&isbn=${decodeURIComponent(
          isbn
        )}&format=json`
      );
    }
    const response = await fetch(url2);
    const data = await response.json();
    console.log("data", data);

    if (response.status === 200) {
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

      // 거리 계산 및 정렬
      libList.forEach((libs) => {
        let distance = getDistance(
          currentLatitude,
          currentLongitude,
          libs.lib.latitude,
          libs.lib.longitude
        );
        libs.lib.distance = distance;
      });

      libList.sort((a, b) => a.lib.distance - b.lib.distance);

      libCodeList = libList.map((libs) => libs.lib.libCode);

      console.log("libList", libList);
      console.log("libCodeList", libCodeList);

      availabilityCheckAll(libCodeList);
    } else {
      throw new Error(`HTTP 오류 발생: ${response.status} - ${data.message}`);
    }
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      errorRender("네트워크 오류 발생! 인터넷 연결을 확인해주세요.");
    } else {
      errorRender(error.message);
    }
  }
};

const availabilityCheck = async (code) => {
  const url3 = `http://data4library.kr/api/bookExist?authKey=${API_KEY}&libCode=${code}&isbn13=9791158392239&format=json`;
  const response = await fetch(url3);
  const data = await response.json();
  return data.response.result.loanAvailable;
};

const availabilityCheckAll = async (libcodes) => {
  const requests = libcodes.map((code) => availabilityCheck(code));
  const responses = await Promise.all(requests);
  availabilityList = responses;
  console.log(availabilityList);
  libsRender();
};

//도서관 목록을 렌더하는 함수
function libsRender() {
  let libListHTML = "";
  for (let i = 0; i < 5; i++) {
    libListHTML += `<div class="row libs">
    <div class="col-lg-8" id="lib-name">
    <i class="fa-solid fa-book"></i>${libList[i].lib.libName}</a></div>
    <div class="info">
      <dl>
      <div>
          <dt class="col-lg-1" id="lib-homepage">
          <i class="fa-solid fa-link"></i>홈페이지</dt>
          <dd class="col-lg-10"><a href="${
            libList[i].lib.homepage
          }" target="_blank">${libList[i].lib.libName || "정보 없음"}</a></dd>
          </div>
        <div>
          <dt class="col-lg-1" id="lib-call">
          <i class="fa-solid fa-phone"></i>전화번호</dt>
          <dd class="col-lg-10"><a href="tel:${libList[i].lib.tel}">${
      libList[i].lib.tel || "정보 없음"
    }</a></dd>
        </div>
        <div>
          <dt class="col-lg-1">
        <i class="fa-solid fa-location-dot"></i>
        주소</dt>
          <dd class="col-lg-10" id="lib-address" onclick="copyAddress(event)">${
            libList[i].lib.address || "주소 정보 없음"
          }</dd>
        </div>
        <div>
          <dt class="col-lg-1" id="lib-time">
        <i class="fa-solid fa-clock"></i>
        영업시간</dt>
          <dd class="col-lg-10">${
            libList[i].lib.operatingTime || "정보 없음"
          }</dd>
        </div>
        <div>
          <dt class="col-lg-1" id="lib-close-day">
        <i class="fa-solid fa-calendar-minus"></i>
        휴관일</dt>
          <dd class="col-lg-10">${libList[i].lib.closed || "정보 없음"}</dd>
        </div>
        <div>
            <dt class="col-lg-1" id="lib-loan">
            <i class="fa-solid fa-book-bookmark"></i>
          대출여부</dt>
          <dd class="col-lg-10">
          ${`
            <i class="fa-solid ${
              availabilityList[i] == "Y" ? "fa-circle-dot" : "fa-x"
            }" style="color: ${
            availabilityList[i] == "Y" ? "#5feca3" : "#c22424"
          };"></i>
          `}
        </dd>
        
          </div>
      </dl>
    </div>
  </div>`;

    positions.push({
      title: `${libList[i].lib.libName}`,
      latlng: new kakao.maps.LatLng(
        libList[i].lib.latitude,
        libList[i].lib.longitude
      ),
    });
  }
  for (let i = 0; i < positions.length; i++) {
    // 마커 이미지의 이미지 크기 입니다
    let imageSize = new kakao.maps.Size(24, 35);
    // 마커 이미지를 생성합니다
    let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
    // 마커를 생성합니다
    let marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: positions[i].latlng, // 마커를 표시할 위치
      title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
      image: markerImage, // 마커 이미지
    });
  }
  console.log("html :", libListHTML);
  console.log(positions);
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

const getDistance = (lat1, lon1, lat2, lon2) => {
  // Convert degrees to radians
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLon1 = (lon1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const radLon2 = (lon2 * Math.PI) / 180;

  // Radius of the Earth in meters
  const R = 6_371_000; // m

  // Differences in coordinates
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(2); // Return distance rounded to 2 decimal places
};
