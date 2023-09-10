import App from './model/App'

process.on('uncaughtException', function (err) {
	console.log(err)
})

const app = new App()
app.start(8080)

export default app
