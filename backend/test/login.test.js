const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../index');
const Nurse = require('../database/models/nurse');
const mongoose = require('../database/dbConnection');
let id;
let token;
describe('for login and registration endpoints', ()=> {
    beforeAll(async ()=>{
//        const password = bcrypt.hashSync('okay', 10);
        await Nurse.create({
            name: 'name',
            username: "nurse",
            password: 'okay',
            email: 'nursename@gmail.com',
            phone: 111222333
        });    
    });
    afterAll( async()=>{
        await Nurse.deleteMany();
        mongoose.disconnect();
    });
    //login test
    describe('POST /login', ()=>{
        it ('It should authenticate user and sign in', async () => {
            //saved to database
            const nurse = {
                username: 'nurse',
                password: 'okay',

            };
            const res = await request(app)
            .post('/login')
            .send(nurse);
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('accessToken');
            //expect(res.body).toEqual(
            //    expect.objectContaining({
            //        accessToken : res.body.accessToken,
            //        success : true,
            //        data : expect.objectContaining({
            //            id: res.body.data.id,
            //            username: res.body.data.username
            //        }),
            //    }),
            //);
        });
        it ('It should not sign in, password field empty.', 
        async() =>{
            const nurse ={
                username: 'nurse',
            };
            const res = await request(app)
            .post('/login')
            .send(nurse);
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: 'username or password cannot be empty.'
                }),
            );
        });
        it ('It should not sign in, username field empty.',
        async() => {
            //data saved to database
            const nurse = {
                password: 'okay'
            };
            const res = await request(app)
            .post('/login')
            .send(nurse);
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success : false,
                    message : 'username or password cannot be empty.'
                }),
            );
        });
        it ('It should not sign in, username does not exist',
        async() => {
            const nurse = {
                username : 'NotaNurse',
                password : 'okay'
            }
            const res = await request(app)
            .post('/login')
            .send(nurse);
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: 'invalid credentials'
                }),
            );
        });
        it ('It should not sign in, incorrect password.',
        async() => {
            const nurse = {
                username : "nurse",
                password : 'incorrectPass'
            };
            const res = await request(app)
            .post('/login')
            .send(nurse);
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success : false,
                    message : 'invalid credentials'
                }),
            );
        });
    });
    // Register test
    describe('POST/nurses', ()=>{
        it ('It should register a new nurse', async() =>{
            //Data saved to db
            const nurses = {
                name : 'name',
                username : 'nurses',
                password: 'pass',
                email: 'namenurse@gmail.com',
                phone: 1112223333
            }
            const res = await request(app)
            .post('/nurses')
            .send(nurses)
            .set('Authorization', `Bearer ${token}`)
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success : true,
                    data : expect.any(Object)
                }),
            );
            id = res.body._ID
        });
        it ('It should not save the nurse, empty field.', async()=>{
            const nurses = {
                name : 'name',
                password: 'pass',
                email: 'namenurse@gmail.com',
                phone: 1112223333
            }
            const res = await request(app)
            .post('/nurses')
            .send(nurses)
            .set('Authorization', `Bearer ${token}`)
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success : false,
                    error: expect.arrayContaining([
                        expect.stringContaining('Username')
                    ])
                }),
            );
        });
        it ('It should not save the nurse, invalid token', async()=>{
            const nurses = {
                name : 'name',
                username : 'InvalidToken',
                password: 'pass',
                email: 'namenurse@gmail.com',
                phone: 1112223333
            }
            const res = await request(app)
            .post('/nurses')
            .send(nurses)
            .set('Authorization', 'Bearer wrongString')
            //debugging
            console.log(res.body);
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual(
                expect.objectContaining({
                    success : false,
                    message : 'unauthorized'
                }),
            );
        });
    });
});