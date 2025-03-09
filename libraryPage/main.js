const API_KEY =
  "0be2c234076cb8fbd8415ff20f098c4d8056523a3bba5af8ccb7f29cddee5a79";
const REST_API_KEY =
  "ca710ae75f9527abf30dff43d799e344";

let libList = [];
let currentLatitude = 33.450701;
let currentLongitude = 126.570667;
let regionCode = 39;
let options = {};
let container = document.getElementById('map'); // 카카오 맵 컨테이너
let regionCodeTable = {
    "서울": "11",
    "부산": "21",
    "대구": "22",
    "인천": "23",
    "광주": "24",
    "대전": "25",
    "울산": "26",
    "세종": "29",
    "경기": "31",
    "강원": "32",
    "충북": "33",
    "충남": "34",
    "전북": "35",
    "전남": "36",
    "경북": "37",
    "경남": "38",
    "제주특별자치도": "39"
  }
  let positions = [];
  let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";  

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // ✅ 위치 정보를 가져온 경우
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;
      
      options = {
        center: new kakao.maps.LatLng(currentLatitude, currentLongitude),
        level: 10
      };
      
      // ✅ 지도를 생성
      map = new kakao.maps.Map(container, options);
      reverseGeocoding(currentLatitude, currentLongitude);
    },
    (error) => {
      // ❌ 위치 권한 거부 or 오류 발생 시 기본값 사용
      console.warn("위치 정보를 가져올 수 없음. 기본 좌표로 설정합니다.", error);

      options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 10
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
    level: 10
  };

  // ✅ 기본 좌표로 지도를 생성
  map = new kakao.maps.Map(container, options);
  reverseGeocoding(33.450701, 126.570667);
}

const reverseGeocoding = async (Lat,Lng) => {
  let url1 = new URL(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${Lng}&y=${Lat}`)
  const response = await fetch(url1, {
    method: "GET",
    headers: {
      "Authorization": `KakaoAK ${REST_API_KEY}`
    }
  });
  const data = await response.json();
  let region = data.documents[0].address.region_1depth_name;
  regionCode = +regionCodeTable[region];
  getLibList();
}

//api에서 데이터를 받아오는 함수
const getLibList = async () => {
  let url2 = new URL( //도서 소장 도서관api
    `http://data4library.kr/api/libSrchByBook?authKey=${API_KEY}&region=${regionCode}&isbn=9788995772423&format=json`
  );
  const response = await fetch(url2);
  const data = await response.json();
  console.log("data", data);

  libList = data.response.libs;
  libList.forEach((libs) => {
    let distance = getDistance(currentLatitude, currentLongitude, libs.lib.latitude, libs.lib.longitude)
    libs.lib.distance = distance;
  })
  libList.sort((a,b) => {
    if (a.lib.distance > b.lib.distance) {
      return 1;
    }
    if (a.lib.distance < b.lib.distance) {
      return -1;
    }
    return 0;
  })

  console.log("libList", libList);

  libsRender();
};

function libsRender() {
  let libListHTML = ""
  for (let i=0;i<5;i++) {
    libListHTML += `<div class="row libs">
      <div class="col-lg-8" id="lib-name">
      <a href="${libList[i].lib.homepage}">
      <i class="fa-solid fa-book"></i>${libList[i].lib.libName}</a></div>
      <div class="info">
        <dl>
          <div>
            <dt class="col-lg-1" id="lib-call">
            <i class="fa-solid fa-phone"></i>전화번호</dt>
            <dd class="col-lg-10"><a href="tel:${libList[i].lib.tel}">${libList[i].lib.tel}</a></dd>
          </div>
          <div>
            <dt class="col-lg-1">
          <i class="fa-solid fa-location-dot"></i>
          주소</dt>
            <dd class="col-lg-10" id="lib-address" onclick="copyAddress(event)">${libList[i].lib.address}</dd>
          </div>
          <div>
            <dt class="col-lg-1" id="lib-time">
          <i class="fa-solid fa-clock"></i>
          영업시간</dt>
            <dd class="col-lg-10">${libList[i].lib.operatingTime}</dd>
          </div>
          <div>
            <dt class="col-lg-1" id="lib-close-day">
          <i class="fa-solid fa-calendar-minus"></i>
          휴관일</dt>
            <dd class="col-lg-10">${libList[i].lib.closed}</dd>
          </div>
        </dl>
      </div>
      </div>`
    positions.push({
      title: `${libList[i].lib.libName}`,
      latlng: new kakao.maps.LatLng(libList[i].lib.latitude, libList[i].lib.longitude)
    })
  };
  for (let i = 0; i < positions.length; i ++) {
    // 마커 이미지의 이미지 크기 입니다
    let imageSize = new kakao.maps.Size(24, 35); 
    // 마커 이미지를 생성합니다    
    let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); 
    // 마커를 생성합니다
    let marker = new kakao.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: positions[i].latlng, // 마커를 표시할 위치
        title : positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
        image : markerImage // 마커 이미지 
    });
  }
  console.log("html :", libListHTML);
  console.log(positions);
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

const getDistance = (lat1, lon1, lat2, lon2) => {
  // Convert degrees to radians
  const radLat1 = lat1 * Math.PI / 180;
  const radLon1 = lon1 * Math.PI / 180;
  const radLat2 = lat2 * Math.PI / 180;
  const radLon2 = lon2 * Math.PI / 180;

  // Radius of the Earth in meters
  const R = 6_371_000; // m

  // Differences in coordinates
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(2); // Return distance rounded to 2 decimal places
};
