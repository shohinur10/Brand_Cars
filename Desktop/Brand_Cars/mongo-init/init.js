// MongoDB initialization script for Brand Cars
db = db.getSiblingDB('brandcars_dev');

// Create collections
db.createCollection('members');
db.createCollection('cars');
db.createCollection('boardarticles');
db.createCollection('comments');
db.createCollection('likes');
db.createCollection('follows');
db.createCollection('views');
db.createCollection('notices');
db.createCollection('notifications');

// Create indexes for better performance
db.members.createIndex({ "email": 1 }, { unique: true });
db.members.createIndex({ "memberNick": 1 }, { unique: true });
db.cars.createIndex({ "carBrand": 1 });
db.cars.createIndex({ "carPrice": 1 });
db.cars.createIndex({ "createdAt": -1 });
db.boardarticles.createIndex({ "articleTitle": "text", "articleContent": "text" });
db.boardarticles.createIndex({ "createdAt": -1 });
db.comments.createIndex({ "commentRefId": 1 });
db.likes.createIndex({ "likeRefId": 1, "memberId": 1 }, { unique: true });
db.follows.createIndex({ "followerId": 1, "followingId": 1 }, { unique: true });

print('Brand Cars database initialized successfully!');