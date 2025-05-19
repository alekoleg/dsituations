# Dialog Situations

How to run localy
```
npm run dev
```

How to compile

```
npm run compile
```

On server 
```
pm2 restart/stop/start dist/index.js
```

Curl example
```
#!/bin/bash
curl -X POST \
  -H "X-Parse-Application-Id: dhsuadghdfkjgjw3p1209410sdfvmoi3" \
  -H "X-Parse-Language: rf" \
  -H "Content-Type: application/json" \
  -d '{}' \
  http://localhost:9090/api/parse/functions/appState
  ```





API документация в файле [API.md](API.md)