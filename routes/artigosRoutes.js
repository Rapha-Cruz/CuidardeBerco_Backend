const express = require('express')
const router = express.Router()
const artigosController = require('../controllers/artigosController')
const auth = require('../middlewares/authMiddleware')

// 🔓 PÚBLICO
router.get('/', artigosController.listar)
router.get('/:id', artigosController.buscarPorId)
// Listar artigos por categoria
router.get('/categorias/:categoriaId', artigosController.listarPorCategoria)


// 🔐 ADMIN
router.post('/', auth, artigosController.criar)
router.put('/:id', auth, artigosController.atualizar)
router.delete('/:id', auth, artigosController.deletar)

module.exports = router
