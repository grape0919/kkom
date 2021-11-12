from tinydb import TinyDB, Query


class UserModel:

    def __init__(self, path='db.json'):
        self.db = TinyDB(path)

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
        self.db = TinyDB(path)

    def upsert_key(self, user):
        if not self.db.search(Query().id == user.id):
            self.db.insert(user.serialize())

    def get_key(self, user_id):
        user = self.db.search(Query().id == user_id)
        return TemplateData.deserialize(user[0])

    def remove_user(self, user_id):
        self.db.remove(Query().id == user_id)
        
class TemplateData:
    
    def __init__(self, temp_val=None):
        if temp_val:
            self.key = temp_val['key']
            self.value = temp_val['value']
        else:
            self.key = None
            self.value = None

    def __str__(self):
        return "<TemplateData>(key:%s, value:%s)" \
                % (self.key, self.value)

    def serialize(self):
        return {
            "key": self.key,
            "value": self.value
        }
    @staticmethod
    def deserialize(temp_val):
        user = TemplateData()
        user.key = temp_val['key']
        user.value = temp_val['value']
        return user