const { visitUrl } = require('./adminBot')
const express = require('express')
const path = require('path')
const session = require('express-session');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const app = express()
const port = process.env.PORT || 7001
//const DOMAIN = process.env.DOMAIN || "http://localhost"

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
	secret: 'your-secret',
	resave: false,
	saveUninitialized: true,
}));

const users = {
	'admin': bcrypt.hashSync(randomUUID(), 10)
};

const posts = {};

app.get('/', (req, res) => {
	if (req.session.user) {
		res.redirect('/edit');
	}
	res.redirect('login');
})

app.get('/login', (req, res) => {
	res.render('login', { error: null, user: req.session.user });
});

app.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/login');
	});
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;

	if (users[username]) {
		const match = bcrypt.compareSync(password, users[username]);
		if (match) {
			req.session.user = username;
			return res.redirect('/edit');
		}
		return res.render('login', { error: 'Invalid credentials', user: null });
	}
	users[username] = bcrypt.hashSync(password, 10);
	req.session.user = username;
	posts[username] = {
		title: `${req.session.user}'s Post`,
		content: "",
		public: false
	};
	res.redirect('/edit');
});

app.get('/edit', (req, res) => {
	if (!req.session.user) return res.redirect('/login');
	let post = posts[req.session.user];
	res.render('edit', { post, user: req.session.user, hacker: req.query.hacker });
});

app.get('/view/:user', (req, res) => {
	const post = posts[req.params.user];
	if (!post) return res.status(404).send('Post not found');
	const ownBlog = req.params.user === req.session.user;
	if (!ownBlog && !post.public) {
		return res.status(403).send('Post not accessible');
	}

	res.render('view', { post, ownBlog, user: req.session.user });
});

app.post('/save', (req, res) => {
	if (!req.session.user) return res.redirect('/login');
	const newPost = {
		title: req.body.title,
		content: req.body.content,
		public: req.body.public == 'true'
	};
	if (newPost.content.includes("<script>") || newPost.title.includes("<script>")) {
		return res.redirect('/edit?hacker=true');
	}
	posts[req.session.user] = newPost;
	res.redirect('/edit');
});

app.post('/share', async (req, res) => {
	if (!req.session.user) return res.status(403).json({ error: 'unauthorized' });

	const user = req.session.user;
	const baseUrl = req.protocol + '://' + req.get('host');
	const url = `${baseUrl}/view/${encodeURIComponent(user)}`;

	try {
		await visitUrl(url);
		res.json({ status: 'ok' });
	} catch {
		res.status(500).json({ status: 'error' });
	}
});

app.listen(port, () => { })
