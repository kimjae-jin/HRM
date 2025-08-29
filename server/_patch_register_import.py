import io,sys,os,re

BASE = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(BASE,"app.py")
with open(p,"r",encoding="utf-8") as f:
    s = f.read()

# 이미 등록돼 있으면 건너뜀
if "from import_routes import import_routes" in s or "register_blueprint(import_routes" in s:
    print("이미 import_routes 등록됨")
    sys.exit(0)

# CORS(app) 줄 바로 아래에 2줄 삽입
new = re.sub(
    r'(CORS\(app\).*\n)',
    r'\1from import_routes import import_routes\napp.register_blueprint(import_routes, url_prefix="/api")\n',
    s, count=1, flags=re.DOTALL
)

if new == s:
    print("CORS(app) 기준 위치를 못 찾음. 파일 상단에 등록 줄 추가.")
    new = 'from import_routes import import_routes\n' \
          'app.register_blueprint(import_routes, url_prefix="/api")\n' + s

with open(p,"w",encoding="utf-8") as f:
    f.write(new)

print("import_routes 블루프린트 등록 완료")
