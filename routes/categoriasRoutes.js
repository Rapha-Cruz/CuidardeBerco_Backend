const express = require('express')
const router = express.Router()

const categoriasController = require('../controllers/categoriasController')

router.get('/', categoriasController.listar)
router.post('/', categoriasController.criar)
router.delete('/:id', categoriasController.deletar)
router.put('/:id', categoriasController.atualizar)

module.exports = router
