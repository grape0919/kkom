from tinydb import TinyDB, Query
import os

class UserModel:

    def __init__(self, path='db.json'):
        basdir = os.path.abspath(os.getcwd())
        path = os.path.join(basdir, 'db.json')
        self.db = TinyDB(path).table('user')

    def upsert_user(self, user):
        if not self.db.search(Query().id == user.id):
            self.db.insert(user.serialize())

    def get_user(self, user_id):
        user = self.db.search(Query().id == user_id)
        return UserData.deserialize(user[0])

    def remove_user(self, user_id):
        self.db.remove(Query().id == user_id)


class UserData:
    
    def __init__(self, user=None):
        if user:
            user_info = user['kakao_account']['profile']
            self.id = user['id']
            self.nickname = user_info['nickname']
            self.profile = user_info['profile_image_url'] 
            self.thumbnail = user_info['thumbnail_image_url']
        else:
            self.id = None
            self.nickname = None
            self.profile = None
            self.thumbnail = None

    def __str__(self):
        return "<UserData>(id:%s, nickname:%s)" \
                % (self.id, self.nickname)

    def serialize(self):
        return {
            "id": self.id,
            "nickname": self.nickname,
            "profile": self.profile,
            "thumbnail": self.thumbnail
        }

    @staticmethod
    def deserialize(user_data):
        user = UserData()
        user.id = user_data['id']
        user.nickname = user_data['nickname']
        user.profile = user_data['profile']
        user.thumbnail = user_data['thumbnail']
        return user
    
class TemplateModel:

    def __init__(self, path='db.json'):
        self.db = TinyDB(path).table('temp')

    def upsert_key(self, temp):
        self.db.upsert(temp.serialize(), Query().key == temp.key and Query().temp_id == temp.temp_id)

    def get_key(self, temp_name, temp_id):
        temp = self.db.search(Query().key == temp_name and Query().temp_id == temp_id)
        return TemplateData.deserialize(temp[0])
    
    def get_temp(self, temp_id):
        temp_key_value = self.db.search(Query().temp_id == int(temp_id))
        temp_key_value = [ TemplateData.deserialize(temp) for temp in temp_key_value]
        return temp_key_value
    
    def get_temp_list(self):
        temp_key_value = self.db.all()
        temp_key_value = [ TemplateData.deserialize(temp) for temp in temp_key_value]
        return temp_key_value
    
    def get_all_val(self):
        temps = self.db.all()
        return temps

    def remove_val(self, temp_name):
        self.db.remove(Query().key == temp_name and Query().temp_id == temp.temp_id)
        
class TemplateData:
    
    def __init__(self, temp_val=None):
        if temp_val:
            self.temp_id = temp_val['temp_id']
            self.key = temp_val['key']
            self.value = temp_val['value']
        else:
            self.temp_id = None
            self.key = None
            self.value = None

    def __str__(self):
        return "<TemplateData>(temp_id, key:%s, value:%s)" \
                % (self.key, self.value)

    def serialize(self):
        return {
            "temp_id": self.temp_id,
            "key": self.key,
            "value": self.value
        }
    @staticmethod
    def deserialize(temp_val):
        temp = TemplateData()
        temp.temp_id = temp_val['temp_id']
        temp.key = temp_val['key']
        temp.value = temp_val['value']
        return temp