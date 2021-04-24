CREATE DATABASE homepage;
USE homepage;

CREATE TABLE user(
    user_id varchar(30) primary key,
    user_pw varchar(30),
    user_name varchar(30),
    gender varchar(30)
);

CREATE TABLE board(
    idx int auto_increment primary key,
    id varchar(30),
    subject varchar(50) not null,
    content text,
    date datetime default now(),
    hit int,
    constraint board_id
    foreign key (id)
    references user(user_id)
);

