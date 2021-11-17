"""
Flask Kakao OAuth Application Sample
"""
import json
from flask import Flask, render_template, request, jsonify, make_response, send_from_directory, redirect
from flask_jwt_extended import (
    JWTManager, create_access_token, 
    get_jwt_identity, jwt_required,
    set_access_cookies, set_refresh_cookies, 
    unset_jwt_cookies, create_refresh_token,
    jwt_refresh_token_required,
)
import os,sys

sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from src.config import CLIENT_ID, REDIRECT_URI
from src.controller import Oauth
from src.model import TemplateData, TemplateModel, UserModel, UserData

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = "KKOM2"
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 500
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 10000
jwt = JWTManager(app)


@app.route("/")
def index():
    return redirect("/kkom")


@app.route("/auth")
def oauth_api():
    """
    # OAuth API [GET]
    사용자로부터 authorization code를 인자로 받은 후,
    아래의 과정 수행함
    1. 전달받은 authorization code를 통해서
        access_token, refresh_token을 발급.
    2. access_token을 이용해서, Kakao에서 사용자 식별 정보 획득
    3. 해당 식별 정보를 서비스 DB에 저장 (회원가입)
    3-1. 만약 이미 있을 경우, (3) 과정 스킵
    4. 사용자 식별 id를 바탕으로 서비스 전용 access_token 생성
    """
    code = str(request.args.get('code'))
    
    oauth = Oauth()
    auth_info = oauth.auth(code)
    
    user = oauth.userinfo("Bearer " + auth_info['access_token'])
    
    user = UserData(user)
    UserModel().upsert_user(user)

    resp = make_response(redirect("/kkom"))
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    resp.set_cookie("logined", "true")
    resp.set_cookie("kakako_access_token", auth_info['access_token'])
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)

    return resp


@app.route('/token/refresh')
@jwt_refresh_token_required
def token_refresh_api():
    """
    Refresh Token을 이용한 Access Token 재발급
    """
    user_id = get_jwt_identity()
    resp = jsonify({'result': True})
    access_token = create_access_token(identity=user_id)
    set_access_cookies(resp, access_token)
    return resp


@app.route('/token/remove')
def token_remove_api():
    """
    Cookie에 등록된 Token 제거
    """
    resp = jsonify({'result': True})
    unset_jwt_cookies(resp)
    resp.delete_cookie('logined')
    return resp


@app.route("/userinfo")
@jwt_required
def userinfo():
    """
    Access Token을 이용한 DB에 저장된 사용자 정보 가져오기
    """
    user_id = get_jwt_identity()
    userinfo = UserModel().get_user(user_id).serialize()
    return jsonify(userinfo)


@app.route('/auth/url')
def oauth_url_api():
    """
    Kakao OAuth URL 가져오기
    """
    return jsonify(
        kakao_oauth_url="https://kauth.kakao.com/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code" \
        % (CLIENT_ID, REDIRECT_URI)
    )

@app.route('/auth/url/agreements')
def oauth_agreement_url_api():
    """
    Kakao OAuth URL 가져오기
    """
    return jsonify(
        kakao_oauth_url="https://kauth.kakao.com/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=friends" \
        % (CLIENT_ID, REDIRECT_URI)
    )

@app.route("/auth/refresh", methods=['POST'])
def oauth_refesh_api():
    """
    # OAuth Refresh API
    refresh token을 인자로 받은 후,
    kakao에서 access_token 및 refresh_token을 재발급.
    (% refresh token의 경우, 
    유효기간이 1달 이상일 경우 결과에서 제외됨)
    """
    refresh_token = request.get_json()['refresh_token']
    result = Oauth().refresh(refresh_token)
    return jsonify(result)


@app.route("/authw", methods=['POST'])
def oauth_userinfo_api():
    """`
    # OAuth Userinfo API
    kakao access token을 인자로 받은 후,
    kakao에서 해당 유저의 실제 Userinfo를 가져옴
    """
    access_token = request.get_json()['access_token']
    result = Oauth().userinfo("Bearer " + access_token)
    return jsonify(result)

@app.route("/authw", methods=['GET'])
def oauth_additional_scope():
    '''
    추가 동의 요청
    ''' 

@app.route("/kkom")
def kkom():
    '''
    kkom 메인페이지
    '''
    
    temps = TemplateModel().get_all_val()
    
    return render_template("main.html", values=temps)

@app.route("/kkom/friends", methods=["GET"])
def get_friends():
    '''
    친구목록가져오기
    '''
    access_token = request.cookies.get('kakako_access_token')
    friends = Oauth().friends("Bearer " + access_token)
    return jsonify(friends)
    
    
@app.route("/kkom/addval", methods=["POST"])
def add_value():
    '''
    template value 등록하기
    '''
    try:
        req = request.get_json()
        temp = {}
        temp['key'] = req['val_name']
        temp['value'] = ""
        
        temp = TemplateData(temp)
        TemplateModel().upsert_key(temp)
    
        msg= "succeed"
        
        status_code = 200
        
    except:
        msg= "저장 실패"
        status_code = 500
        
    return jsonify({"mag":msg, "code":status_code})

@app.route("/kkom/delval", methods=["DELETE"])
def del_value():
    '''
    template value 삭제하기
    '''
    try:
        req = request.get_json()
        val_name = req['val_name']
        
        TemplateModel().remove_val(val_name)
    
        msg= "succeed"
        
        status_code = 200
        
    except:
        msg= "저장 실패"
        status_code = 500
        
    return jsonify({"mag":msg, "code":status_code})

@app.route("/kkom/savetemp", methods=["PUT"])
def save_value():
    '''
    template value 저장하기
    '''
    try:
        req = request.get_json()
        id = req['template_id']
        val_list:dict = req['template_args']
        
        data = {"key": "template_id", "value":id.strip()}
        data = TemplateData(data)
        TemplateModel().upsert_key(data)
    
        for k, v in val_list.items():
            data = {"key": k.strip(), "value":v.strip()}
            data = TemplateData(data)
            TemplateModel().upsert_key(data)
    
        msg= "succeed"
        status_code = 200
        
    except:
        msg= "저장 실패"
        status_code = 500
        
    return jsonify({"mag":msg, "code":status_code})
    

@app.route("/kkom/sendme", methods=["POST"])
def sendme():
    '''
    나에게 보내기
    '''
    req = request.get_json()
    template_id = req["template_id"]
    template_args = req["template_args"]
    
    access_token = request.cookies.get('kakako_access_token')
    
    result = Oauth().sendme("Bearer " + access_token, template_id, json.dumps(template_args, ensure_ascii=True))
    
    if "result_code" in result:
        result = {
        "msg" : "succeed",
        "status" : 200
        }
    else:
        result = {
            "msg" : result['msg'],
            "status" : -402
        }
        
    return jsonify(result)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'img'),
                               'kkom.ico', mimetype='image/vnd.microsoft.icon')
    
import webbrowser

webbrowser.open("http://localhost")

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=80, debug=True)