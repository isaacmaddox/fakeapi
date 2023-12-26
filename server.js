const bodyparser = require('body-parser');
const express = require('express');
const cookieparser = require('cookie-parser');

let usersId = 0;
let postsId = 0;

const users = [];
const posts = [];

const app = express();
app.use(bodyparser.json({ type: 'application/json' }));
app.use(cookieparser());

app.get('/', (req, res) => {
    res.status(200);
    res.json({
        body: {
            'message': 'Testing'
        },
        timetamp: new Date(),
    });
})

app.get('/users', (req, res) => {
    res.status(200);
    res.json({
        body: users,
        timestamp: new Date(),
    })
})

app.post('/user/new', (req, res) => {
    const body = req.body;

    users.push({
        id: ++usersId,
        ...body
    });
    res.status(200);
    res.json({
        body: { id: usersId, ...body },
        timestamp: new Date(),
    })
})

app.post('/login', (req, res) => {
    const body = req.body;

    const obj = users.find(u => (u.email === body.username || u.handle === body.username) && u.password === body.password);

    if (obj) {
        res.status(200);
        res.cookie('user', obj.id, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({
            message: "Logged in.",
            timestamp: new Date(),
        });
    } else {
        res.status(401);
        res.json({
            error: "Invalid credentials",
            timestamp: new Date(),
        })
    }
})

app.get('/posts', (req, res) => {
    res.status(200);
    res.json({
        body: posts.map(post => {
            return {
                ...post,
                user: users.find(u => u.id === post.user)
            }
        }),
        timestamp: new Date(),
    })
})

app.post('/post/new', (req, res) => {
    const body = req.body;

    const user = req.cookies.user ?? undefined;

    if (!user) {
        res.status(401);
        res.json({
            error: 'Not authorized',
            timestamp: new Date()
        })
        return;
    }

    const post = {
        id: ++postsId,
        user: user,
        ...body
    }

    posts.push(post);

    res.status(200);
    res.json({
        body: post,
        timestamp: new Date()
    })
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})