DELETE FROM route_hashtags;
DELETE FROM comments;
DELETE FROM photos;
DELETE FROM route_points;
DELETE FROM routes;
DELETE FROM hashtags;
DELETE FROM memories;
DELETE FROM users;

INSERT INTO users (user_id, username, nickname, created_at)
VALUES (1, '사용자1', '사용자1', '2024-10-29 10:00:00');
INSERT INTO users (user_id, username, nickname, created_at)
VALUES (2, '사용자2', '사용자2', '2024-10-29 10:00:00');
INSERT INTO users (user_id, username, nickname, created_at)
VALUES (3, '사용자3', '사용자3', '2024-10-29 10:00:00');

-- Stories
INSERT INTO memories (story_id, title, description, created_at, visibility, plan_state, user_id, preference, like_count)
VALUES (1, '행복한 여행', '행복한 여행을 떠나며 즐거웠던 순간들을 기록했습니다.', '2024-10-29 10:00:00', 'PUBLIC', 'PUBLISH', 1, 3, 120);
INSERT INTO memories (story_id, title, description, created_at, visibility, plan_state, user_id, preference, like_count)
VALUES (2, '맛있는 음식 여행', '맛있는 음식을 먹으며 보낸 즐거운 여행의 기록입니다.', '2024-10-28 12:00:00', 'PUBLIC', 'PUBLISH', 2, 2, 98);
INSERT INTO memories (story_id, title, description, created_at, visibility, plan_state, user_id, preference, like_count)
VALUES (3, '도시 탐방', '도시 곳곳을 탐방하며 기록한 소중한 순간들입니다.', '2024-10-27 15:00:00', 'PUBLIC', 'PUBLISH', 3, 1, 75);

-- Routes
INSERT INTO routes (route_id, name, story_id)
VALUES (1, '행복한 여행 경로', 1);
INSERT INTO routes (route_id, name, story_id)
VALUES (2, '맛집 탐방 경로', 2);
INSERT INTO routes (route_id, name, story_id)
VALUES (3, '도시 탐방 경로', 3);

-- RoutePoints
INSERT INTO route_points (point_id, latitude, longitude, order_num, route_id)
VALUES (1, 37.564991, 126.983937, 1, 1);
INSERT INTO route_points (point_id, latitude, longitude, order_num, route_id)
VALUES (2, 37.566158, 126.988940, 2, 1);
INSERT INTO route_points (point_id, latitude, longitude, order_num, route_id)
VALUES (3, 37.570991, 126.982937, 1, 2);
INSERT INTO route_points (point_id, latitude, longitude, order_num, route_id)
VALUES (4, 37.572158, 126.989940, 2, 2);
INSERT INTO route_points (point_id, latitude, longitude, order_num, route_id)
VALUES (5, 37.567991, 126.981937, 1, 3);
INSERT INTO photos (photo_id, file_path, taken_at, latitude, longitude, story_id)
VALUES (1, '/Users/son-yeonghyeon/Desktop/image/image1.jpeg', '2024-10-29 10:00:00', 37.564991, 126.983937, 1);

INSERT INTO photos (photo_id, file_path, taken_at, latitude, longitude, story_id) 
VALUES (2, '/Users/son-yeonghyeon/Desktop/image/image2.jpeg', '2024-10-29 10:30:00', 37.566158, 126.988940, 1);

INSERT INTO photos (photo_id, file_path, taken_at, latitude, longitude, story_id)
VALUES (3, '/Users/son-yeonghyeon/Desktop/image/image3.jpeg', '2024-10-28 12:30:00', 37.570991, 126.982937, 2);

INSERT INTO photos (photo_id, file_path, taken_at, latitude, longitude, story_id)
VALUES (4, '/Users/son-yeonghyeon/Desktop/image/image4.jpeg', '2024-10-28 13:00:00', 37.572158, 126.989940, 2);

INSERT INTO photos (photo_id, file_path, taken_at, latitude, longitude, story_id)
VALUES (5, '/Users/son-yeonghyeon/Desktop/image/image5.jpeg', '2024-10-27 15:00:00', 37.567991, 126.981937, 3);

-- Hashtags
INSERT INTO hashtags (hashtag_id, name) VALUES (1, '여행');
INSERT INTO hashtags (hashtag_id, name) VALUES (2, '행복');
INSERT INTO hashtags (hashtag_id, name) VALUES (3, '기록');
INSERT INTO hashtags (hashtag_id, name) VALUES (4, '맛집');
INSERT INTO hashtags (hashtag_id, name) VALUES (5, '음식여행');
INSERT INTO hashtags (hashtag_id, name) VALUES (6, '도시탐방');
INSERT INTO hashtags (hashtag_id, name) VALUES (7, '산책');

-- Route-Hashtag Mappings
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (1, 1);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (1, 2);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (1, 3);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (2, 4);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (2, 5);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (2, 2);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (3, 6);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (3, 7);
INSERT INTO route_hashtags (route_id, hashtag_id) VALUES (3, 3);

-- Comments
INSERT INTO comments (id, content, created_at, story_id, user_id)
VALUES (1, '정말 즐거워 보이네요!', '2024-10-29 12:00:00', 1, 1);
INSERT INTO comments (id, content, created_at, story_id, user_id)
VALUES (2, '사진이 멋져요!', '2024-10-29 12:15:00', 1, 2);
INSERT INTO comments (id, content, created_at, story_id, user_id)
VALUES (3, '음식이 너무 맛있어 보여요!', '2024-10-28 13:30:00', 2, 3);
INSERT INTO comments (id, content, created_at, story_id, user_id)
VALUES (4, '여행 가고 싶네요!', '2024-10-28 14:00:00', 2, 1);
INSERT INTO comments (id, content, created_at, story_id, user_id)
VALUES (5, '도시 구경 너무 좋아요!', '2024-10-27 16:00:00', 3, 2);