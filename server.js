const Alert = require('alert')
require('dotenv').config();
const env = process.env;
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const mysql = require('mysql');
const e = require('express');
const port = env.SERVER_PORT;
let LOGIN_CHECK = false;
let logedId = '';


app.use(express.urlencoded({extended:false}));
app.set('view engine', 'html');
 
nunjucks.configure('views',{
    express:app,
});


const connection = mysql.createConnection({
    host:env.DB_HOST,
    user:env.DB_USER,
    password:env.DB_PW,
    database:env.DB_NAME
});
connection.connect();

app.get('/', (req,res)=>{
    if(LOGIN_CHECK){
        res.redirect('/board_view'); 
    }else{
        res.render('index.html',{
        })
    }
})


app.get('/login',(req, res)=>{
    res.render('login.html',{
    })
})

app.post('/login',(req, res)=>{
    console.log('login',req.body.id, req.body.pw);
    
    res.render('login.html',{
        
    })
    
})

app.get('/join',(req, res)=>{
    res.render('join.html',{
    })
})

app.post('/join',(req, res)=>{
    console.log('join',req.body.id, req.body.pw);
    res.render('join.html',{
        
    })
    
})

app.get('/board_view',(req, res)=>{
    if(LOGIN_CHECK){    

        connection.query('select idx, id, subject, hit from board', (error, results)=>{
            if(!error){
                res.render('board_view.html',{
                    id:logedId,
                    boardTable:results
                })
            }else{
                console.log('board query error');
            }
        })
              
    }
})

app.post('/board_view',(req, res)=>{

    if(req.body.id==''){
        Alert('id를 입력해주세요');
        res.redirect('/login'); 
        
    }else{
        if(req.body.pw==''){
            Alert('비밀번호를 입력해주세요')
            res.redirect('/login'); 
        }else{

            connection.query(`select user_id from user where user_id='${req.body.id}'`, (error, results)=>{
                if(error){
                    console.log('error');
                }else{

                    connection.query(`select user_pw from user where user_id='${req.body.id}'`, (error, results)=>{
                        if(!error&&String(req.body.pw)==results[0].user_pw){
                            LOGIN_CHECK = true;
                            logedId = req.body.id;
                            connection.query('select idx, id, subject, hit from board', (error, results)=>{
                                if(!error){
                                    res.render('board_view.html',{
                                        id:req.body.id,
                                        boardTable:results
                                    })
                                }else{
                                    console.log('board query error');
                                }
                            })
                          
                        }else{
                            Alert('아이디와 비밀번호를 확인해주세요')
                        }
                    })

                }
            })

        }
    }
    
})



app.listen(port, ()=>{
    console.log(`it works! port:${port}`);
})