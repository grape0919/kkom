
const init2 = () => {
	// 버튼 이벤트 등록

	document.querySelector("#friend").addEventListener('click', onRefresh);
	// document.querySelector("#temp-val-add").addEventListener('click', onAddVal);
	// document.querySelector("#temp-val-del").addEventListener('click', onDelVal);

	// document.querySelector("#send-me").addEventListener('click', onSendMe);
	// document.querySelector("#send").addEventListener('click', onSend);
}

//친구목록가져오기
const onRefresh = async () => {
	let data = await fetch("/kkom/friends", {
		headers: { "Content-Type": "application/json"},
		method: "GET"
	})
	.then(res => res.json());
	if (data.result) {
		console.log(data)
	}else{
		console.log("새로고침 실패")
	}
}

//템플릿 변수
const onLoadTemplate = async () => {
	let data = await fetch("/kkom/template_val", {
		headers: { "Content-Type": "application/json"},
		method: "GET"
	})
	.then(res => res.json());
	if (data.result) {
		console.log(data)
	}else{
		console.log("새로고침 실패")
	}
}

//나에게 전송
const onSendMe = async () 

init2();