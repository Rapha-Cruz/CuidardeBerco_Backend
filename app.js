require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pool = require('./conexao')
const categoriasRoutes = require('./routes/categoriasRoutes')
const artigosRoutes = require('./routes/artigosRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const usuariosRoutes = require('./routes/usuariosRoutes')
const authMiddleware = require('./middlewares/authMiddleware')

const app = express()

// Middlewares globais
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/usuarios', usuariosRoutes)

app.use('/categorias', categoriasRoutes);
app.use('/artigos', artigosRoutes);
app.use('/upload', authMiddleware, uploadRoutes)

// Rota de teste
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API Cuidar de Berço rodando'
    })
})

//teste do banco
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('select now()')
        res.json({
            status: 'ok',
            database_time: result.rows[0]
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao conectar no banco' })
    }
})

// Porta
const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`)
})
