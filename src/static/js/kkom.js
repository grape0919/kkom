import "kakao.js"

const init2 = () => {
	// 버튼 이벤트 등록

	document.querySelector("#friend").addEventListener('click', onRefresh);
	document.querySelector("#sendMe").addEventListener("click", onSendMe);
	document.querySelector("#temp-save").addEventListener("click", onSaveVal);
	
	// document.querySelector("#temp-val-del").addEventListener('click', onDelVal);

	// document.querySelector("#send").addEventListener('click', onSend);
	
}

//친구목록가져오기
const onRefresh = async () => {
	let data = await fetch("/kkom/friends", {
		headers: { "Content-Type": "application/json"},
		method: "GET"
	})
	.then(res => {
		console.log(res)
		let friends = res['elements']
		console.log(friends)
	}).catch(error => {
		if(error['code'] == -402){ //권한 신청
			onAdditionalAgreements();
		}else{
			console.log(error);
			window.alert("친구목록 가져오기 실패:\n"+error['msg']);
		}
	});
}



const onAdditionalAgreements = async () => {

	let url = await fetch("/auth/url/agreements", {
		headers: { "Content-Type": "application/json" },
		method: "GET"
	})
	.then(res => res.json())
	.then(res => res['kakao_oauth_url']);

	const newWindow = openWindowPopup(url, "친구 목록 가져오기 동의");

	const checkConnect = setInterval(function() {
		if (!newWindow || !newWindow.closed) return;
		clearInterval(checkConnect);
		
		if(getCookie('logined') === 'true') {
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
	for(var i=0 ; i  < template_vals.length; i++){
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}
	
	let body_temp = {"template_id":template_id.value,
					"template_args":val_temp}

	console.log(body_temp)

	let data = await fetch("/kkom/sendme", {
		method: "POST",
		headers: { "Content-Type": "application/json"},
		body :JSON.stringify(body_temp)
	}).then(res => {
		console.log(res.json())
		window.alert("전송 성공")
	}).catch(data => {
		console.log(data)
		window.alert("전송:\n"+data['msg'])
	})
}

//카카오링크API
function onSendFriends(){
	
	onSaveVal();

	var template_id = document.querySelector('#temp_id')
	var template_vals = document.querySelectorAll('#value-list')
	
	let val_temp = {}
	for(var i=0 ; i  < template_vals.length; i++){
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}
	
	let body_temp = {"template_id":template_id.value,
					"template_args":val_temp}
	Kakao.Link.sendCustom({
		templateId: 62166,
		templateArgs: {
			title1:
			'판교 맛집에 들르다. 다양하고 풍부한 퓨전 한정식. 깔끔한 내부 인테리어 라이언',
			dist1:
			'부담없는 가격에 푸짐하게 즐기는 점심메뉴 런치한정식, 불고기정식, 돼지 김치찌개 등',
		},
	})
}

function sendLink() {
    Kakao.Link.sendCustom({
      templateId: 3135,
      templateArgs: {
        title:
          '판교 맛집에 들르다. 다양하고 풍부한 퓨전 한정식. 깔끔한 내부 인테리어 라이언',
        description:
          '부담없는 가격에 푸짐하게 즐기는 점심메뉴 런치한정식, 불고기정식, 돼지 김치찌개 등',
      },
    })
  }

const onSaveVal = async () => {
	var template_id = document.querySelector('#temp_id')
	var template_vals = document.querySelectorAll('#value-list')

	let val_temp = {}
	for(var i=0 ; i  < template_vals.length; i++){
		console.log(template_vals[i])
		value_name = template_vals[i].querySelector("#val_name").textContent.trim()
		temp_val = template_vals[i].querySelector("#temp_val").value.trim()
		val_temp[value_name] = temp_val
	}
	
	let body_temp = {"template_id":template_id.value,
					"template_args":val_temp}

	console.log(body_temp)

	let data = await fetch("/kkom/savetemp", {
		method: "PUT",
		headers: { "Content-Type": "application/json"},
		body :JSON.stringify(body_temp)
	}).catch(error => {
		console.log(error)
		window.alert("저장 실패:\n"+error)}
	)


}

init2();

var addModal = document.getElementById('addModal')
addModal.addEventListener('show.bs.modal', function (event) {
	// Button that triggered the modal
	var button = event.relatedTarget;
	// Extract info from data-bs-* attributes
	var modalBodyInput = addModal.querySelector('.modal-body input');

	modalBodyInput.value = '';

	var saveButton = addModal.querySelector('.modal-footer button')
	
	onSaveVal();

	saveButton.addEventListener('click', function (event){
		
		var val_name = addModal.querySelector('#add_temp_name')
		console.log(val_name.value)

		let body_temp = {"val_name": val_name.value}

		let data = fetch("/kkom/addval", {
			method: "POST",
			headers: { "Content-Type": "application/json"},
			body :JSON.stringify(body_temp)
		}).then(res => {
			console.log(res);
			$('#addModal').modal('hide');
			window.location.reload();
		})

	});
});

function delVal(val_name){
	
	onSaveVal();

	let body_temp = {"val_name": val_name};

	let data = fetch("/kkom/delval", {
		method: "DELETE",
		headers: { "Content-Type": "application/json"},
		body :JSON.stringify(body_temp)
	}).then(res => {
		console.log(res);
		window.alert("삭제");
		
		location.reload();
	}).catch(error => {
		console.log("삭제 실패");
		window.alert("삭제 실패:\n"+error['msg']);
	})

}