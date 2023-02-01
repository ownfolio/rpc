```bash
# run in repo root
npm ci
npm run start:examples:express

# run in separate terminal
curl -XPOST localhost:3000/v1/ping
curl -XPOST localhost:3000/v1/greet -H 'Content-Type: application/json' -d '{"name":"John"}'
curl -XPOST localhost:3000/v1/user -H 'X-User-ID: user-1'
```
