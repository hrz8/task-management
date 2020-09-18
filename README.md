# Task Management

## Quick Start

### Reuirements

```bash
NATS Server
MySQL
Redis Server
```

### Usage

``` bash
# Install required dependencies
$ npm install
```

``` bash
# Initiate database
$ npm run db:create
$ npm run db:migrate
$ npm run db:seed

# Run testing
$ npm run jest
```

``` bash
# RUn REST API Server
$ node run dev
```

#### Base Endpoint

``` bash
localhost:3000/api
```

#### Available Endpoints

`POST /sign-up`
``` bash
{
    "username": "johndoe1990",
    "fullName": "John Doe",
    "password": "somepassword#123"
}
```

`POST /login`
``` bash
{
    "username": "johndoe1990",
    "password": "somepassword#123"
}
# response will include the needed 'token'
```

`POST /logout/:token`
``` bash
{}
```

`POST /tasks`
``` bash
# Header with Authorization: Bearer token
{
    "location": "Hotel Vero",
    "day": "22/09/2020",
    "startAt": "<optional>", # DD/MM/YYY hh:mm
    "endAt": "<optional>", # DD/MM/YYY hh:mm
    "lists": [
        {
            "description": "Some activity 0",
            "startAt": "<optional>", # DD/MM/YYY hh:mm
            "endAt": "<optional>" # DD/MM/YYY hh:mm
        },
        {
            "description": "Some activity 1",
            "startAt": "<optional>", # DD/MM/YYY hh:mm
            "endAt": "<optional>" # DD/MM/YYY hh:mm
        },
        {
            "description": "Some activity 2",
            "startAt": "<optional>", # DD/MM/YYY hh:mm
            "endAt": "<optional>" # DD/MM/YYY hh:mm
        }
    ]
}
# OR
{
    "location": "GYM",
    "raw": [
        "train biceps for the guns at 9am tomorrow"
    ]
}
# OR
{
    "location": "GYM",
    "raw": [
        "train biceps for the guns at 9am sunday"
    ]
}
```

`GET /tasks`
``` bash
# Header with Authorization: Bearer token
# Response will provide active user's task list
{}
```

`GET /tasks/:id`
``` bash
# Header with Authorization: Bearer token
{}
```

`GET /users`
``` bash
# Header with Authorization: Bearer token
{}
```

`GET /users/:id`
``` bash
# Header with Authorization: Bearer token
{}
```


## App Info

### Authors

Hirzi Nurfakhrian

### Version

1.0.0