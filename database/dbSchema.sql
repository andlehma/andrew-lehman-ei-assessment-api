CREATE TABLE IF NOT EXISTS Users (ID integer primary key, Name varchar(255));
CREATE TABLE IF NOT EXISTS User_Assets (Symbol varchar(32), Quantity real, User_ID integer, FOREIGN KEY(User_ID) REFERENCES Users(ID));
