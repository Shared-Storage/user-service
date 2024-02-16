# SSTORAGE-USER-SERVICE

This project is based on backend of bugtracker software and is used as a service in SSTORAGE project, NodeJS in backend and MongoDB as a database. It contains complete authentication, user management system and subscription management.

## Branches
- complete-authentication branch (v1.0.4) contains authentication & user management system.
- complete-authentication-subscription branch (v1.0.5) contains authentication, user management system and subscription management.


## Environment
- Node version: 18.19.0
- NPM version: 10.2.3

## Setting up environment variables
Take reference from .env.example file.
- Create .env.local.dev and .env.local.staging for development.
- Create .env.deploy.production and .env.deploy.staging for serverless deployments.

### In my case databases, env files and scripts have following relations
- MongoDB atlas production database:
    - .env.deploy.production (`npm run serverless-deploy-production`)
- MongoDB atlas staging database:
    - .env.deploy.staging (`npm run serverless-deploy-staging`)
    - .env.local.staging (`npm start`)
- MongoDB local server:
    - .env.local.dev (`npm run dev`)

## To run the app
Run `$ npm run dev` to run the app in development for local mongodb server.
Run `$ npm start` to run the app in development for staging mongodb server in mongodb atlas.

## To deploy the app (Deployed on AWS Lambda)
Make sure **serverless** is installed `npm i -g serverless` and configured `serverless config credentials --provider aws --key <Key> --secret <Secret>`

To generate keys you can refer here https://www.youtube.com/watch?v=D5_FHbdsjRc

### For staging deployment
`npm run serverless-deploy-staging`

### For staging production
`npm run serverless-deploy-production`

## To test if app is up in development or deployment
In browser run the following: `http://<server_link>/v0/working`

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


## Possible status of organization members
"pending", "accepted" and "declined"