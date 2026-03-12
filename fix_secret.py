import re, os
p = 'Backend/EduPlatform.API/appsettings.json'
if os.path.exists(p):
    f = open(p, encoding='utf-8').read()
    f = re.sub(r'gsk_[A-Za-z0-9]+', 'YOUR_GROQ_API_KEY_HERE', f)
    open(p, 'w', encoding='utf-8').write(f)
