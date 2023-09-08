# Bhojan-backend
Prototype 2

This project is based on [ReactJS in frontend](https://github.com/bug-tracker-software/bts-fe-prototype-2), NodeJS in backend and MongoDB as a database. It contains complete authentication, user management system and subscription management.

## Branches
- complete-authentication branch (v1.0.4) contains authentication & user management system.
- complete-authentication-subscription branch (v1.0.5) contains authentication, user management system and subscription management.


## Environment setup
Nodejs and Express based api.
- Node version used **16.16.0**
- NPM version used **8.11.0**

## Run 
1. Create **.env** and **.env.dev** based on **.env.example** in the root directory.
2. Run `npm install` in terminal to install all packages.
3. Run `npm start`, `npm run start-dev` or `npm run start-local` for environments **.env**, **.env.dev** and **.env.local** respectively.

## Docker
1. For M1/M2 based computer:
`$ docker buildx build --platform linux/amd64 -t app .`
 For Intel based computer:
`$ docker build -t app .`
2. To try run container locally
`$ docker run --rm -d -p 3000:8080 --name app-container  app`
3. To stop container
`$ docker stop app-container`


## Multer image upload tutorial
https://www.youtube.com/watch?v=NZElg91l_ms
## storage bucket for image/file upload
Bucket policy



{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::bucket_name/"
        }
    ]
}



CORS policy in bucket



[
    {
        "AllowedHeaders": [
            ""
        ],
        "AllowedMethods": [
            "GET",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            ""
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]

## Policy permission
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::breadbutterstorage/*"
        }
    ]
}

## Serverless deployment
https://www.youtube.com/watch?v=1IjTYzOfSMc

```$ npm install -g serverless```
```$ serverless config credentials --provider aws --key <KEY> --secret <SECRET>```
```$ serverless create -t aws-nodejs```
```$ npm install --save serverless-http```


