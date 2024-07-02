# Socks Emails

## To start server:
```bash
npm install
npm run start
```

## To test:
```bash
npm run test
```

## Endpoint
http://localhost:3000/trigger-emails

## Sample payload
```bash
{
    "eventNameTrigger": "websiteSignup",
    "userEmail": "christadcooke@gmail.com",
    "emails": [
        {
            "subject": "Welcome",
            "emailBody": "Need some socks?",
            "timeDelay": 7200
        }
    ]
}
```
```
{
    "eventNameTrigger": "socksPurchased",
    "userEmail": "christadcooke@gmail.com",
    "emails": [
        {
            "subject": "Payment received",
            "emailBody": "Thank you!",
            "timeDelay": 0
        },
        {
            "subject": "Socks dispatched!",
            "emailBody": "Get ready!",
            "timeDelay": 0
        }
    ]
}
```


