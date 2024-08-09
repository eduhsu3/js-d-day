let dDayArray = [];

let nowDate = null;
let year = '';
let month = '';
let date = '';
let hours = '';
let minutes = '';
let seconds = '';
let milliseconds = '';
let dateFullStr = '';
let timeFullStr = '';
let weekdays = ['일', '월', '화', '수', '목', '금', '토']; // 요일을 배열에 나열해둠
let dateOfWeekString = '';

//오늘 날짜 가져오기
function getTodayDate() {
    nowDate = new Date();
    year = nowDate.getFullYear();
    month = nowDate.getMonth() + 1;
    date = nowDate.getDate();
    dateOfWeekString = weekdays[nowDate.getDay()]; // 위 배열을 이용해 요일 숫자값을 문자열로 변환
    hours = nowDate.getHours();
    minutes = nowDate.getMinutes();
    seconds = nowDate.getSeconds();
    milliseconds = nowDate.getMilliseconds();
    dateFullStr = `${year}<i>년</i> ${month}<i>월</i> ${date}<i>일<i> <span class="week_name">${dateOfWeekString}요일</span>`;
    timeFullStr = `${hours}<i>시</i> ${minutes}<i>분</i> <span class="second">${seconds}</span><i>초</i>`;
    //화면에 오늘 날짜 출력
    let elePrintDate = document.querySelector('#printTodayDate');
    elePrintDate.innerHTML = dateFullStr;

    //화면에 오늘 시간 출력
    let elePrintTime = document.querySelector('#printTodayTime');
    elePrintTime.innerHTML = timeFullStr;
}

//최초 화면에 랜더링
getTodayDate();

//1초마다 Date() 객체 다시 생성 후 화면에 그려주기
let timeId = setInterval(getTodayDate, 1000);

//=====================================================================================
//=====================================================================================
//=====================================================================================

//UID 제너레이터
function generateUID() {
    const uidDate = new Date();
    return uidDate.getTime().toString();
}

// 로컬 스토리지에 저장
function saveLocalStorage() {
    localStorage.setItem('dDayList', JSON.stringify(dDayArray));
}

// 로컬 스토리지에서 불러오기
function getLocalStorage() {
    const storageData = localStorage.getItem('dDayList');
    if (storageData) {
        dDayArray = JSON.parse(storageData);
    }
}

//남은 날짜 계산
function remaindDateCalc(prmValue) {
    //let dateInputValue = eleDateInput.value;
    //미래 날짜 구하기
    let futureDate = new Date(prmValue);
    //날짜 빼기
    let resultDate = futureDate - nowDate; //2354585685445 이런 타임스탬프 값으로 나옴.. 이대로 사용못하고 아래 변환과정을 거쳐야 함.
    //며칠 남았는지 정수로 변환하기
    let remaindDay = resultDate / (1000 * 60 * 60 * 24); //resultDate 를 날짜 값으로 변환 해주기
    remaindDay = Math.ceil(remaindDay); //소수점이 발생할 수 있기에 소수점은 올림처리 해준다.

    return remaindDay;
}

//=======================================================================================
//=======================================================================================
//=======================================================================================

let eleDateInput = document.querySelector('#dateInput'); //미래날짜 요소 선택
let eleTitleInput = document.querySelector('#titleInput'); //사용자 제목 요소 선택
let eleBtn = document.querySelector('#bottomBtn'); //버튼 요소 선택

//==============================================================
//버튼에 이벤트 바인딩
eleBtn.addEventListener('click', () => {
    if (eleDateInput.value === '') {
        alert('디데이 날짜를 입력해 주세요');
        eleDateInput.focus();
        return;
    }

    if (eleTitleInput.value.trim() === '') {
        alert('디데이 제목을 입력해 주세요');
        eleTitleInput.value = '';
        eleTitleInput.focus();
        return;
    }

    //최초 입력할때 남은 날짜 한번구해보고, 음수값 나오는지 체크해보기
    let remaindDay = remaindDateCalc(eleDateInput.value);
    //console.log(typeof remaindDay); //number
    if (remaindDay < 0) {
        alert('오늘 보다 이전 날짜를 디데이로 선택할 수 없습니다.');
        eleDateInput.value = '';
        eleDateInput.focus();
        return;
    }

    //신규 UID 발급
    let newUID = generateUID();

    //사용자 입력 제목 가져오기
    let userTitleValue = eleTitleInput.value.trim();

    //사용자 선택 날짜 가져오기
    let userDateValue = eleDateInput.value;

    //배열에 목록 추가하기 ------
    dDayArray.push({
        id: newUID,
        date: userDateValue,
        title: userTitleValue,
    });

    //console.log(dDayArray);

    //로컬스토리지에 저장하기 ------
    saveLocalStorage();

    eleDateInput.value = '';
    eleTitleInput.value = '';

    //목록 화면 다시 그려주기 ------
    viewUpdate();
});

function viewUpdate() {
    //목록으로 사용할 템플릿 요소 가져와 데이터 맵핑 후 화면에 랜더링
    const eleUl = document.querySelector('#printWrap');
    eleUl.innerHTML = ''; //목록 화면 초기화
    const template = document.getElementById('item-template').content;
    let eleDefault_block = document.querySelector('.default_block'); //기본 화면 블럭 선택
    let eleModify_block = document.querySelector('.modify_block'); //수정 화면 블럭 선택

    dDayArray.forEach((item) => {
        //기본 데이터 출력 ================================================
        const cloneLi = document.importNode(template, true);
        cloneLi.querySelector('li').id = item.id;
        cloneLi.querySelector('#titleText').textContent = item.title;

        //남은 날짜 구하기
        let remaindDay = remaindDateCalc(item.date);
        switch (remaindDay) {
            case 0:
                changeText = `<span class="b_txt b_a">오늘</span>입니다. 확인하세요.`;
                break;
            case 1:
                changeText = `<span class="b_txt b_b">내일</span>입니다. 준비하세요.`;
                break;
            default:
                changeText = `<span class="b_txt b_c">${remaindDay}</span>일 남았습니다.`;
                break;
        }
        cloneLi.querySelector('#dateText').innerHTML = changeText;

        //수정 버튼
        cloneLi.querySelector('#modifyBtn').addEventListener('click', function () {
            this.closest('li').querySelector('.default_block').style.display = 'none';
            this.closest('li').querySelector('.modify_block').style.display = 'flex';
        });

        //삭제 버튼
        cloneLi.querySelector('#deleteBtn').addEventListener('click', function () {
            let confirmResult = confirm('삭제하시겠습니까?');
            if (!confirmResult) {
                return;
            }

            let thisUID = this.closest('li').id;
            //console.log('삭제 UID : ', thisUID);
            dDayArray = dDayArray.filter((item) => item.id !== thisUID);
            saveLocalStorage();

            viewUpdate();
        });

        //수정 데이터 출력 ================================================
        cloneLi.querySelector('#modifyTitleInput').value = item.title;
        cloneLi.querySelector('#modifyDateInput').value = item.date;

        //수정 완료 버튼
        cloneLi.querySelector('#modifySubmitBtn').addEventListener('click', function () {
            let modifyTitleInput = this.closest('li').querySelector('#modifyTitleInput');
            let modifyDateInput = this.closest('li').querySelector('#modifyDateInput');

            if (modifyTitleInput.value.trim() === '') {
                alert('디데이 제목을 입력해 주세요');
                modifyTitleInput.value = '';
                modifyTitleInput.focus();
                return;
            }

            if (modifyDateInput.value === '') {
                alert('디데이 날짜를 입력해 주세요');
                modifyDateInput.focus();
                return;
            }

            //최초 입력할때 남은 날짜 한번구해보고, 음수값 나오는지 체크해보기
            let remaindDay = remaindDateCalc(modifyDateInput.value);
            //console.log(typeof remaindDay); //number
            if (remaindDay < 0) {
                alert('오늘 보다 이전 날짜를 디데이로 선택할 수 없습니다.');
                //modifyDateInput.value = '';
                modifyDateInput.focus();
                return;
            }

            let thisUID = this.closest('li').id;
            let foundItem = dDayArray.find((item) => item.id === thisUID);
            //수정화면 display.block
            //배열 속 객체 수정
            foundItem.title = modifyTitleInput.value.trim();
            foundItem.date = modifyDateInput.value;

            //로컬스토리지 저장
            saveLocalStorage();
            //화면 다시 그리기
            viewUpdate();
        });

        //수정 취소 버튼
        cloneLi.querySelector('#modifyCancelBtn').addEventListener('click', function () {
            this.closest('li').querySelector('#modifyTitleInput').value = item.title;
            this.closest('li').querySelector('#modifyDateInput').value = item.date;
            this.closest('li').querySelector('.default_block').style.display = 'flex';
            this.closest('li').querySelector('.modify_block').style.display = 'none';
        });

        //화면에 목록 그려주기 ==============================================
        eleUl.appendChild(cloneLi);
    });
}

//최초 웹스토리지에서 데이터 가져와서 --> dDayArray 에 넣어주기
getLocalStorage();

//==============================================================
//최초 dDayArray 배열 순회 하면서 목록 화면에 그려주기
viewUpdate();
