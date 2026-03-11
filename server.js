const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (index.html, main.js, style.css)
app.use(express.static(__dirname));

// Redis 연결 설정
let redis;
try {
    redis = new Redis({
        host: '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 1) return null;
            return 50;
        }
    });

    redis.on('error', (err) => {
        console.warn('Redis connection failed, using in-memory storage.');
        redis = null;
    });
} catch (e) {
    console.warn('Could not initialize Redis client.');
}

let memoryStorage = [];

// 설비 정보 등록 (POST)
app.post('/api/facilities', async (req, res) => {
    const facility = req.body;
    console.log('Registering facility:', facility);

    if (redis) {
        try {
            await redis.rpush('facilities', JSON.stringify(facility));
            res.status(201).json({ message: 'Success' });
        } catch (err) {
            console.error('Redis error:', err);
            memoryStorage.push(facility);
            res.status(201).json({ message: 'Success (Fallback)' });
        }
    } else {
        memoryStorage.push(facility);
        res.status(201).json({ message: 'Success (Memory)' });
    }
});

// 설비 목록 가져오기 (GET)
app.get('/api/facilities', async (req, res) => {
    if (redis) {
        try {
            const data = await redis.lrange('facilities', 0, -1);
            const facilities = data.map(item => JSON.parse(item));
            res.json(facilities);
        } catch (err) {
            console.error('Redis error:', err);
            res.json(memoryStorage);
        }
    } else {
        res.json(memoryStorage);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
