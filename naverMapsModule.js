/**
 *  Naver Maps API Module
 *  (prototype을 이용해 클래스처럼 구현)
 */


// 모듈을 사용하기 위한 function 정의
var naverMapsModule = function() {
    this._map;              // Map 객체
    this._markers = [];     // 마커 배열
    //this._infoWindows = []; // 사용X : 마커에 정보창 객체 저장
};


/**
 * Map 생성(param 없으면 자동 Default 설정)
 * @param zoom : 지도의 초기 줌 레벨
 * @param lat  : 지도의 초기 중심 좌표(위도)
 * @param lon  : 지도의 초기 중심 좌표(경도)
 * @param id   : 지도를 삽입할 HTML 요소 id
 */
naverMapsModule.prototype.initMap = function (zoom, lat, lon, id) {
    // Default 좌표
    var center = new naver.maps.LatLng(37.3595704, 127.105399); // 그린 팩토리
    // Default id
    if(!id) {
        id = 'map';
    }
    // Default zoom level
    if(!zoom) {
        zoom = 13;
    }
    if(lat && lon) {
        center = new naver.maps.LatLng(lat, lon);
    }

    // Map 초기 설정(지도 옵션 객체)
    var mapOptions = {
        center: center,                         // 지도의 초기 중심 좌표
        zoom: zoom,                             // 지도의 초기 줌 레벨
        zoomControl: true,                      // 줌 컨트롤의 표시 여부
        mapTypeControl: true,                   // 지도 유형 컨트롤의 표시 여부
        mapTypeId: naver.maps.MapTypeId.HYBRID, // 초기 지도 유형 설정(위성 겹쳐보기)
        logoControl: false,                     // NAVER 로고 컨트롤의 표시 여부
        mapDataControl: false,                  // 지도 데이터 저작권 컨트롤의 표시 여부
    };

    // Map 생성
    this._map = new naver.maps.Map(id, mapOptions);
};


// Map 객체 반환
naverMapsModule.prototype.getMap = function () {
    return this._map;
};


/**
 * 지정한 좌표와 줌 레벨을 사용하는 새로운 위치로 지도를 이동
 * @param lat  : 이동할 지도의 중심 좌표(위도)
 * @param lon  : 이동할 지도의 중심 좌표(경도)
 * @param zoom : 이동할 지도의 줌 레벨
 */
naverMapsModule.prototype.mapTransfer = function (lat, lon, zoom) {
    var map = this._map;
    var coord = new naver.maps.LatLng(lat, lon);
    map.morph(coord, zoom);
};

/**
 * 마커 추가
 * @param title : 생성할 마커 이름
 * @param lat   : 생성할 마커 좌표(위도)
 * @param lon   : 생성할 마커 좌표(경도)
 */
naverMapsModule.prototype.addMarker = function (title, lat, lon) {
    var position = new naver.maps.LatLng(lat, lon);
    
    var marker = new naver.maps.Marker({
        map: this._map,
        position: position,
        title: title
    });
    
    this._markers.push(marker);
};


// 마커그룹 추가
    /**
     *  마커그룹 정의 예시(JSON 형식)
     *  var MARKER_SPRITE_POSITION = {
     *      //"Title": [lat, lon],
     *      "TEST1": [37.3595704, 127.105399],
     *      "TEST2": [37.3595705, 127.105398],
     *      "TEST3": [37.3595706, 127.105397],
     *  } 
     */
naverMapsModule.prototype.addMarkers = function (MARKER_SPRITE_POSITION) {
    for (var key in MARKER_SPRITE_POSITION) {

        var position = new naver.maps.LatLng(MARKER_SPRITE_POSITION[key][0], MARKER_SPRITE_POSITION[key][1]);
    
        var marker = new naver.maps.Marker({
            map: this._map,
            position: position,
            title: key
        });
    
        this._markers.push(marker);
    };
};


// 현재 지도 영역내 표시되지 않는 부분의 마커를 지도에서 제거하여 최적화
naverMapsModule.prototype.markersOptimization = function () {
    var map = this._map;
    var markers = this._markers;

    naver.maps.Event.addListener(map, 'idle', function () {
        var mapBounds = map.getBounds();    // 현재 지도 범위
        var marker, position;

        for (var i = 0; i < markers.length; i++) {

            marker = markers[i]
            position = marker.getPosition();

            if (mapBounds.hasLatLng(position)) {
                // show marker
                if (marker.getMap()) return;
                marker.setMap(map);
            } else {
                // hide marker
                if (!marker.getMap()) return;
                marker.setMap(null);
            }
        }
    })
};


/**
 *  좌표에 해당하는 마커 반환
 *  @param lat : 찾을 marker의 위도 
 *  @param lon : 찾을 marker의 경도
 *  @returns marker 객체
 */
naverMapsModule.prototype.getMarkerToLatLon = function (lat, lon) {
    var markers = this._markers;
    var position = new naver.maps.LatLng(lat, lon);

    for (var i = 0; i < markers.length; i++) {
        marker = markers[i]
        if(marker.getPosition().equals(position)) {
            return marker;
        }
    }
};

/**
 * GeoJSON 형식의 지리 공간 데이터를 추가
 * @param geojson : 표시할 GeoJSON 데이터 
 */
naverMapsModule.prototype.addGeoJson = function (geojson) {
    this._map.data.addGeoJson(geojson);
};


/**
 * GeoJSON 형식의 지리 공간 데이터를 삭제
 * @param geojson : 삭제할 GeoJSON 데이터
 */
naverMapsModule.prototype.removeGeoJson = function (geojson) {
    this._map.data.removeGeoJson(geojson);
};


/**
 * 데이터 레이어 전역 스타일 설정
 * @param color : 바꿔 줄 데이터 레이어의 컬러 값
 */
naverMapsModule.prototype.setDataLayerStyle = function (color) {
    this._map.data.setStyle(function (feature) {
        if (feature.getProperty('color')) {
            color = feature.getProperty('color');
        }
    
        return {
            strokeColor: color, // 테두리
            fillColor: color    // 채움
        };
    });
};


/**
 * 특정 Feature 객체 스타일 재정의
 * @param feature : 스타일을 바꿀 Feature 객체
 * @param color   : 바꿔 줄 스타일 컬러 값
 */
 naverMapsModule.prototype.setFeatureStyle = function (feature, color) {
    this._map.data.overrideStyle(feature, {
        strokeColor: color,
        fillColor: color
    });
};


/**
 * 데이터 레이어 스타일 복구(param 없으면 전체 복구)
 * @param feature  : 스타일을 복구할 Feature 객체
 */
naverMapsModule.prototype.resetFeatureStyle = function (feature) {
    var map = this._map;
    if(feature){
        map.data.revertStyle(feature);
    } else {
        map.data.revertStyle();
    }
};


/**
 *  지도 제한 영역 설정(두 좌표의 중심 기준)
 *  @param lat1     : 첫 번째 제한 영역 좌표
 *  @param lon1     : 첫 번째 제한 영역 좌표
 *  @param lat2     : 두 번째 제한 영역 좌표
 *  @param lon2     : 두 번째 제한 영역 좌표
 *  @param minZoom  : 제한할 zoom level
 */
naverMapsModule.prototype.limitBounds = function (lat1, lon1, lat2, lon2, minZoom) {
    var maxBounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(lat1, lon1),
        new naver.maps.LatLng(lat2, lon2));
    
    this._map.setOptions("maxBounds", maxBounds);
    this._map.setOptions("minZoom", minZoom);
};



/**
 *  좌표로 주소 검색
 *  Geocoder 서브 모듈 로드 필요
 *  @param lat : 주소 검색할 좌표(위도)
 *  @param lon : 주소 검색할 좌표(경도)
 *  @return htmlAddresses = ['지번 주소', '도로명 주소'] (문자열 배열)
 */
naverMapsModule.prototype.searchAddressToLatlon = function (lat, lon) {
    var htmlAddresses = [];
    var coord = new naver.maps.LatLng(lat, lon);

    naver.maps.Service.reverseGeocode({
        coords: coord,
        orders: [
            naver.maps.Service.OrderType.ADDR,
            naver.maps.Service.OrderType.ROAD_ADDR
        ].join(',')
    }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
            return alert('Something Wrong!');
        }

        var items = response.v2.results,
            address = '';

        for (var i=0, ii=items.length, item, addrType; i<ii; i++) {
            item = items[i];
            address = makeAddress(item) || '';
            //addrType = item.name === 'roadaddr' ? '[도로명 주소] ' : '[지번 주소] ';
            addrType = '';

            htmlAddresses.push(addrType + address);
        }
    });

    function makeAddress(item) {
        if (!item) {
            return;
        }
    
        var name = item.name,
            region = item.region,
            land = item.land,
            isRoadAddress = name === 'roadaddr';
    
        var sido = '', sigugun = '', dongmyun = '', ri = '', rest = '';
    
        if (hasArea(region.area1)) {
            sido = region.area1.name;
        }
    
        if (hasArea(region.area2)) {
            sigugun = region.area2.name;
        }
    
        if (hasArea(region.area3)) {
            dongmyun = region.area3.name;
        }
    
        if (hasArea(region.area4)) {
            ri = region.area4.name;
        }
    
        if (land) {
            if (hasData(land.number1)) {
                if (hasData(land.type) && land.type === '2') {
                    rest += '산';
                }
    
                rest += land.number1;
    
                if (hasData(land.number2)) {
                    rest += ('-' + land.number2);
                }
            }
    
            if (isRoadAddress === true) {
                if (checkLastString(dongmyun, '면')) {
                    ri = land.name;
                } else {
                    dongmyun = land.name;
                    ri = '';
                }
    
                if (hasAddition(land.addition0)) {
                    rest += ' ' + land.addition0.value;
                }
            }
        }
    
        return [sido, sigugun, dongmyun, ri, rest].join(' ');
    }
    
    function hasArea(area) {
        return !!(area && area.name && area.name !== '');
    }
    
    function hasData(data) {
        return !!(data && data !== '');
    }
    
    function checkLastString (word, lastString) {
        return new RegExp(lastString + '$').test(word);
    }
    
    function hasAddition (addition) {
        return !!(addition && addition.value);
    }

    return htmlAddresses;
};


/**
 *  주소로 좌표 검색
 *  Geocoder 서브 모듈 로드 필요
 *  @param address : 좌표 검색할 주소 
 *  @returns point = [lat, lon];
 */
naverMapsModule.prototype.searchLatLonToAddress = function (address) {
    var map = this._map;
    var point = [];
    naver.maps.Service.geocode({
        query: address
    }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
            return alert('Something Wrong!');
        }

        if (response.v2.meta.totalCount === 0) {
            console.log('Search Fail : TotalCount' + response.v2.meta.totalCount);
        }

        var item = response.v2.addresses[0];
        point.push(item.y);
        point.push(item.x);
    });

    return point;
};


/**
 *  정보 창 기본 템플릿 HTML 문자열 생성
 *  @param  header : 정보 창 머리말
 *  @param  body   : 정보 창 본문
 *  @param  footer : 정보 창 꼬리말
 *  @returns contentString : HTML 형식 문자열
 */
naverMapsModule.prototype.createDefaultInfoContent = function (header, body, footer) {
    var contentString = [
        '<div class="iw_inner" style="width:300px;padding:10px;">',
        '   <h3>' + header + '</h3>',
        '   <p>' + body + '<br />',
        '   ' + footer + '</p>',
        '</div>'
    ].join('');

    return contentString;
};


/**
 *  마커에 정보 창을 추가(저장) 및 표시
 *  @param contentString : 표시할 정보 창(HTML 형식 문자열)
 *  @param marker        : 마커 객체
 */
naverMapsModule.prototype.addInfoWindowOnMarker = function (contentString, marker) {
    var infoWindow = new naver.maps.InfoWindow({
        content: contentString,
        borderWidth: 5
    });

    infoWindow.open(this._map, marker); // 정보 창 표시
    marker.infoWindow = infoWindow;     // 마커에 정보 창 데이터 추가
};


/**
 *  좌표에 정보 창 표시 및 반환(정보 창 정보 저장되지 않음)
 *  @param contentString : 표시할 정보 창(HTML 형식 문자열)
 *  @param lat           : 정보 창 표시할 좌표(위도)
 *  @param lon           : 정보 창 표시할 좌표(경도) 
 */
naverMapsModule.prototype.popupInfoWindowOnCoordinate = function (contentString, lat, lon) {
    var coord = new naver.maps.LatLng(lat, lon);

    var infoWindow = new naver.maps.InfoWindow({
        content: contentString,
        borderWidth: 5
    });

    infoWindow.open(this._map, coord);

    return infoWindow;
};


/**
 *  정보 창 스타일 설정 (배경 및 폰트 컬러)
 *  @param infoWindow       : 스타일 설정할 정보 창 객체
 *  @param backgroundColor  : 바꿔 줄 배경 컬러 값
 *  @param fontColor        : 바꿔 줄 폰트 컬러 값
 */
naverMapsModule.prototype.setInfoWindowStyle = function (infoWindow, backgroundColor, fontColor) {
     var contentString = '<div class="iw_font" style="color:'+ fontColor +'">' + infoWindow.content + '</div>';

    infoWindow.setOptions({
        content : contentString,
        backgroundColor: backgroundColor,
        anchorSkew: true,
        anchorColor: backgroundColor,
    });
};