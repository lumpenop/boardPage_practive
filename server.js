const Alert = require('alert')
require('dotenv').config();
const env = process.env;
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const mysql = require('mysql');

const port = env.SERVER_PORT;
let LOGIN_CHECK = false;
let logedId = '';


app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
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
connection.connect(); // db 연결

app.get('/', (req,res)=>{
    if(LOGIN_CHECK){
        res.redirect('/board_view'); 
    }else{
        res.render('index.html',{
        })
    }
})

/*
    app = express
    express.method([URI], callbackFunction(요청, 응답)=>{
    })
    요청 : 클라이언트(사용자)의 요청
    응답 : 서버의 응답
*/

app.get('/login',(req, res)=>{
    res.render('login.html',{
    })
})

app.post('/login',(req, res)=>{
    res.render('login.html',{
    })
})

app.get('/join',(req, res)=>{
    res.render('join.html',{
    })
})

app.post('/join',(req, res)=>{
    connection.query(`insert into user(user_id, user_pw, user_name, gender) values('${req.body.id}', '${req.body.pw}', '${req.body.name}','${req.body.gender}')`, (error, results)=>{
        if(!error){
            res.redirect('/login')
        }else{
            console.log('join error');
        }
    })
   
})

app.get('/board_write', (req, res)=>{
    res.render('board_write.html');
})

app.post('/board_write',(req, res)=>{
   
    connection.query(`insert into board(id, subject, content) values('${logedId}' ,'${req.body.subject}', '${req.body.content}')`, (error, results)=>{
        console.log(results.insertId)
        if(!error){
            
            res.redirect(`/view?idx=${results.insertId}`)
        }else{
            console.log('board query error');
        }
    })
})

app.get('/board_view',(req, res)=>{
    if(LOGIN_CHECK){    

        connection.query('select idx, id, subject, hit from board order by idx desc', (error, results)=>{
            if(!error){
                res.render('board_view.html',{
                    id:logedId,
                    boardTable:results
                })
            }else{
                console.log('board query error');
            }
        })
              
    }else{
        res.redirect('/');
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
                            res.redirect('/board_view');
                        }else{
                            Alert('아이디와 비밀번호를 확인해주세요')
                        }
                    })
                }
            })

        }
    }
    
})

app.get('/view', (req, res)=>{
    
    if(LOGIN_CHECK){
        connection.query(`update board set hit=hit+1 where idx=${req.query.idx}`,(error, reuslts)=>{
            
            if(error){
                console.log('view error');
            }
        })

        connection.query(`select idx, id, subject, hit, content from board where idx=${req.query.idx}`,(error, reuslts)=>{
        
            if(!error){
                res.render('view.html', {
                    idx : reuslts[0].idx,
                    hit : reuslts[0].hit,
                    id : reuslts[0].id,
                    subject : reuslts[0].subject,
                    content : reuslts[0].content
                    }
                );

            }else{
                console.log('view select error');
            }
        })
    }else{
        res.redirect('/')
    }
    
})

app.get('/board_modify',(req, res)=>{
    
    connection.query(`select idx, id, subject, hit, content from board where idx=${req.query.idx}`,(error, reuslts)=>{
        
        if(!error){
            res.render('board_modify.html', {
                idx : reuslts[0].idx,
                user : reuslts[0].id,
                subject : reuslts[0].subject,
                content : reuslts[0].content
                }
            );

        }else{
            console.log('modify query error1');
        }
    })
})

app.post('/board_modify', (req, res)=>{
    connection.query(`update board set subject='${req.body.subject}', content='${req.body.content}' where idx=${req.body.idx}`,(error, reuslts)=>{
        
        if(error){
            console.log('modify query error');
        }else{
            res.redirect('/board_view')
        }
    })
})

app.get('/board_del', (req, res)=>{
  
    connection.query(`delete from board where idx=${req.query.idx}`,(error, reuslts)=>{
        
        if(error){
            console.log('delete query error');
        }else{
            res.redirect('/board_view')
        }
    })
})


app.listen(port, ()=>{
    console.log(`it works! port:${port}`);
})