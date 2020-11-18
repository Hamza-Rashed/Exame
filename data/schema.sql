drop table if exists characters;

create table characters(
    id serial primary key,
    name varchar(100),
    patronus varchar(100),
    alive varchar(50)
);