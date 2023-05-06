
// SDK를 초기화 합니다. 사용할 앱의 JavaScript 키를 설정해 주세요.
Kakao.init('ffead96dc53b79988fa9926d1902fed8');

// SDK 초기화 여부를 판단합니다.
console.log(Kakao.isInitialized());

// # 시작 함수
// 해당파일제일 최하단에 실행함수 존재함.
const init = () => {
	// 버튼 이벤트 등록
	document.querySelector("#kakao").addEventListener('click', onKakao);
	document.querySelector("#logout").addEventListener('click', onLogout);

	// 자동 로그인 실행
	autoLogin();

	// 해당 함수는 Router 대신 실행하는 함수입니다.
	redirectPage();

	document.querySelector("#sendMe").addEventListener("click", onSendMe);
	document.querySelector("#sendAll").addEventListener("click", onSendAll);
	document.querySelector("#temp-save").addEventListener("click", onSaveVal);
}

// 팝업창 열기
const openWindowPopup = (url, name) => {
	var options = 'top=10, left=10, width=500, height=600, status=no, menubar=no, toolbar=no, resizable=no';
	return window.open(url, name, options);
}

// 카카오 OAuth
const onKakao = async () => {

	let url = await fetch("/auth/url", {
		headers: { "Content-Type": "application/json" },
		method: "GET"
	})
		.then(res => res.json())
		.then(res => res['kakao_oauth_url']);

	const newWindow = openWindowPopup(url, "카카오톡 로그인");

	const checkConnect = setInterval(function () {
		if (!newWindow || !newWindow.closed) return;
		clearInterval(checkConnect);

		if (getCookie('logined') === 'true') {
			window.location.reload();
			real_token = getCookie("kakako_access_token");
			console.log("token : " + real_token);
			Kakao.Auth.setAccessToken(real_token);
			console.log(Kakao.Auth.getStatusInfo())
			document.querySelector("#real-body").classList.remove('blurEffect');
		} else {
			document.querySelector("#real-body").classList.add('blurEffect');
		}
	}, 1000);
}
// OAuth 로그인 후, 리다이렉트 페이지
const redirectPage = () => {
	// 만약 /auth 으로 이동된다면 자동으로 해당 창은 닫습니다.
	const pathname = window.location.pathname;
	if (pathname.startsWith('/auth')) {
		window.close();
	}
}

// 자동 로그인
const autoLogin = async () => {
	let data = await fetch("/userinfo", {
		headers: { "Content-Type": "application/json" },
		method: "GET"
	})
		.then(res => res.json());
	try {
		if (!!data['msg']) {
			if (data['msg'] === `Missing cookie "access_token_cookie"`) {
				console.log("자동로그인 실패");

				document.querySelector("#real-body").classList.add('blurEffect');
				return;
			} else if (data['msg'] === `Token has expired`) {
				console.log("Access Token 만료");
				refreshToken();
				return;
			}
		} else {
			console.log("자동로그인 성공");

			document.querySelector("#real-body").classList.remove('blurEffect');
			const nickname = document.querySelector("#nickname");
			const thumnail = document.querySelector("#thumnail");

			nickname.textContent = `${data.nickname}`;
			thumnail.src = data.profile;

			document.querySelector('#kakao').classList.add('display_none');
			document.querySelector('#logout').classList.remove('display_none');
			nickname.classList.remove('display_none');
			thumnail.classList.remove('display_none');
		}
	} catch (error) {
		console.log(`Error: ${error}`);
		return;
	}
}

// 토큰 재발급
const refreshToken = async () => {
	let data = await fetch("/token/refresh", {
		headers: { "Content-Type": "application/json" },
		method: "GET"
	})
		.then(res => res.json());
	if (data.result) {
		console.log("Access Token 갱신");
		autoLogin();
	} else {
		if (data.msg === `Token has expired`) {
			console.log("Refresh Token 만료");

			document.querySelector('#kakao').classList.remove('display_none');
			document.querySelector('#logout').classList.add('display_none');
			document.querySelector("#nickname").classList.add('display_none');
			document.querySelector("#thumnail").classList.add('display_none');

			onKakao();
			return;
		}

		fetch("/token/remove", {
			headers: { "Content-Type": "application/json" },
			method: "GET"
		});
		alert("로그인을 다시 해주세요!");

		document.querySelector('#kakao').classList.remove('display_none');
		document.querySelector('#logout').classList.add('display_none');
		document.querySelector("#nickname").classList.add('display_none');
		document.querySelector("#thumnail").classList.add('display_none');

		real_token = getCookie("kakako_access_token");
		console.log("token : " + real_token);
		Kakao.Auth.setAccessToken(real_token);

		console.log(Kakao.Auth.getStatusInfo())

	}
}

// 로그아웃
const onLogout = async () => {
	let data = await fetch("/token/remove", {
		headers: { "Content-Type": "application/json" },
		method: "GET"
	})
		.then(res => res.json());

	if (data.result) {
		console.log("로그아웃 성공");
		alert("정상적으로 로그아웃이 되었습니다.");
		window.location.reload();
	} else {
		console.log("로그아웃 실패");
	}
}

const getCookie = (cookieName) => {
	let cookieValue = null;
	if (document.cookie) {
		let array = document.cookie.split((escape(cookieName) + '='));
		if (array.length >= 2) {
			let arraySub = array[1].split(';');
			cookieValue = unescape(arraySub[0]);
		}
	}
	return cookieValue;
}


//친구목록가져오기
// const onRefresh = async () => {
// 	let data = await fetch("/kkom/friends", {
// 		headers: { "Content-Type": "application/json" },
// 		method: "GET"
// 	})
// 		.then(res => {
// 			console.log(res)
// 			let friends = res['elements']
// 			console.log(friends)
// 		}).catch(error => {
// 			if (error['code'] == -402) { //권한 신청
// 				onAdditionalAgreements();
// 			} else {
// 				console.log(error);
// 				window.alert("친구목록 가져오기 실패:\n" + error['msg']);
// 			}
// 		});
// }



const onAdditionalAgreements = async () => {

	let url = await fetch("/auth/url/agreements", {
		headers: { "Content-Type": "application/json" },
		method: "GET"
	})
		.then(res => res.json())
		.then(res => res['kakao_oauth_url']);

	const newWindow = openWindowPopup(url, "친구 목록 가져오기 동의");

	const checkConnect = setInterval(function () {
		if (!newWindow || !newWindow.closed) return;
		clearInterval(checkConnect);

		if (getCookie('logined') === 'true') {
			window.location.reload();
			document.querySelector("#real-body").classList.remove('blurEffect');
		} else {
			document.querySelector("#real-body").classList.add('blurEffect');
		}
	}, 1000);
}


//나에게 전송
const onSendMe = async () => {

	onSaveVal();

	var template_id = document.querySelector('#temp_id')
	var template_vals = document.querySelectorAll('#value-list')

	let val_temp = {}
	for (var i = 0; i < template_vals.length; i++) {
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}

	let body_temp = {
		"template_id": template_id.value,
		"template_args": val_temp
	}

	console.log(body_temp)

	let data = await fetch("/kkom/sendme", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body_temp)
	}).then(res => {
		console.log(res.json())
		window.alert("전송 성공")
	}).catch(data => {
		console.log(data)
		window.alert("전송:\n" + data['msg'])
	})
}

//카카오링크API
async function onSendFriends() {

	onSaveVal();

	var template_id = document.querySelector('#temp_id')
	var template_vals = document.querySelectorAll('#value-list')

	let val_temp = {}
	for (var i = 0; i < template_vals.length; i++) {
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}

	let body_temp = {
		"template_id": template_id.value,
		"template_args": val_temp
	}

	let data = await fetch("/kkom/sendme", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body_temp)
	}).then(res => {
		console.log(res.json())
		window.alert("전송 성공")
	}).catch(data => {
		console.log(data)
		window.alert("전송:\n" + data['msg'])
	})
}

//모두에게 전송
const onSendAll = async () => {

	onSaveVal();

	var template_id = document.querySelector('#temp_id')
	var template_vals = document.querySelectorAll('#value-list')

	let val_temp = {}
	for (var i = 0; i < template_vals.length; i++) {
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}

	let body_temp = {
		"template_id": template_id.value,
		"template_args": val_temp
	}

	console.log(body_temp)

	let data = await fetch("/kkom/sendall", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body_temp)
	}).then(res => {
		console.log(res.json())
		window.alert("전송 성공")
	}).catch(data => {
		console.log(data)
		window.alert("전송:\n" + data['msg'])
	})
}

const onSaveVal = async () => {
	var template_id = document.querySelector('#temp_id')
	var template_vals = document.querySelectorAll('#value-list')

	let val_temp = {}
	for (var i = 0; i < template_vals.length; i++) {
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}

	let body_temp = {
		"template_id": template_id.value,
		"template_args": val_temp
	}

	console.log(body_temp)

	let data = await fetch("/kkom/savetemp", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body_temp)
	}).catch(error => {
		console.log(error)
		window.alert("저장 실패:\n" + error)
	}
	)


}


init();



var addModal = document.getElementById('addModal')
addModal.addEventListener('show.bs.modal', function (event) {
	// Button that triggered the modal
	var button = event.relatedTarget;
	// Extract info from data-bs-* attributes
	var modalBodyInput = addModal.querySelector('.modal-body input');

	modalBodyInput.value = '';

	var saveButton = addModal.querySelector('.modal-footer button')

	onSaveVal();

	saveButton.addEventListener('click', function (event) {

		var val_name = addModal.querySelector('#add_temp_name')
		console.log(val_name.value)

		let body_temp = { "val_name": val_name.value }

		let data = fetch("/kkom/addval", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body_temp)
		}).then(res => {
			console.log(res);
			$('#addModal').modal('hide');
			window.location.reload();
		})

	});
});


function delVal(val_name) {

	onSaveVal();

	let body_temp = { "val_name": val_name };

	let data = fetch("/kkom/delval", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body_temp)
	}).then(res => {
		console.log(res);
		window.alert("삭제");

		location.reload();
	}).catch(error => {
		console.log("삭제 실패");
		window.alert("삭제 실패:\n" + error['msg']);
	})

}