import App from './model/App'

// TODO inserer le vrai port par default (process.env.PORT)

const app = new App()
app.start(8080)

export default app
