import requests
from src.config import CLIENT_ID, REDIRECT_URI


class Oauth:
    
    def __init__(self):
        self.auth_server = "https://kauth.kakao.com%s"
        self.api_server = "https://kapi.kakao.com%s"
        self.default_header = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        }

    def auth(self, code):
        response = requests.post(
            url=self.auth_server % "/oauth/token", 
            headers=self.default_header,
            data={
                "grant_type": "authorization_code",
                "client_id": CLIENT_ID,
                "redirect_uri": REDIRECT_URI,
                "code": code,
            }, 
        )
        return response.json()


    def refresh(self, refresh_token):
        return requests.post(
            url=self.auth_server % "/oauth/token", 
            headers=self.default_header,
            data={
                "grant_type": "refresh_token",
                "client_id": CLIENT_ID,
                "refresh_token": refresh_token,
            }, 
        ).json()


    def userinfo(self, bearer_token):
        return requests.post(
            url=self.api_server % "/v2/user/me", 
            headers={
                **self.default_header,
                **{"Authorization": bearer_token}
            },
            #"property_keys":'["kakao_account.profile_image_url"]'
            data={}
        ).json()
        
    def friends(self, bearer_token):
        req = requests.get(
            url=self.api_server % "/v1/api/talk/friends",
            headers={
                **self.default_header,
                **{"Authorization": bearer_token}
            },data={}
        )
        return req.json()

    def userids(self, admin_key):
        user_list = []
        temp = requests.get(url=self.api_server % "/v1/user/ids", 
        headers={
            **{"Authorization": admin_key}
        }).json()
        user_list.extend(temp['elements'])
        after_url = temp['after_url'] if 'after_url' in temp else False
        while(after_url):
            temp = requests.get(url=after_url, 
            headers={
                **{"Authorization": admin_key}
            }).json()
            user_list.extend(temp['elements'])
            after_url = temp['after_url'] if 'after_url' in temp else False
            
        
        return user_list
        
    def sendme(self, bearer_token, template_id, template_args):
        return requests.post(
            url=self.api_server % "/v2/api/talk/memo/send", 
            headers={
                **self.default_header,
                **{"Authorization": bearer_token}
            },
            #"property_keys":'["kakao_account.profile_image_url"]'
            data={
                "template_id" : template_id
                #  "template_args" : template_args
            }
        ).json()
        
    def sendall(self, bearer_token, template_id, template_args, user_list):
        for user in user_list:
            try:
                requests.post(
                    url=self.api_server % "/v1/api/talk/friends/message/send", 
                    headers={
                        **self.default_header,
                        **{"Authorization": bearer_token}
                    },
                    #"property_keys":'["kakao_account.profile_image_url"]'
                    data={
                        "template_id" : template_id,
                        "template_args" : template_args
                    }
                ).json()
            except:
                print(user," 에게 전송실패")
        return {
            "result_code": 200
        }