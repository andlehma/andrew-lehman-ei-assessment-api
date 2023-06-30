CREATE TABLE IF NOT EXISTS Users (ID integer primary key, Name varchar(255));
CREATE TABLE IF NOT EXISTS User_Assets (AssetID varchar(255), Quantity real, User_ID integer, FOREIGN KEY(User_ID) REFERENCES Users(ID));
